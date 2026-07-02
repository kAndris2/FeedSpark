import { ILogable, LogSeverity } from "../Interfaces/ILogable";
import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { IYoutubeTopic } from "../Interfaces/IYoutubeSettings";
import { IYoutubeChannelData, IYoutubeChannelImageData, IYoutubeVideoData, IYoutubeVideoStatistics } from "../Interfaces/IYoutubeSummary";
import { DateHelper } from "../Misc/DateHelper";
import { HelperConstants } from "../Misc/HelperConstants";
import { RssNamespaceProvider } from "../Misc/RssNamespaceProvider";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { ClassifiedYoutubeChannelDatabase } from "../Models/ClassifiedYoutubeChannelDatabase";
import { XmlElement } from "../Models/XmlElement";
import { YoutubeSettings } from "../Models/YoutubeSettings";
import { YoutubeSummary } from "../Models/YoutubeSummary";
import { ConverterService } from "./ConverterService";
import { GenericLogger } from "./GenericLogger";
import { PropertyService, PropertyType } from "./PropertyService";
import { RssFeedParserFactory } from "./RssFeedParserFactory";
import { YoutubeAiService } from "./YoutubeAiService";
import { YoutubeDriveService } from "./YoutubeDriveService";
import { YoutubeService } from "./YoutubeService";

export class YoutubeRssProcessor implements ILogable {
    private readonly _aiService: YoutubeAiService;
    private readonly _rssFeedParser: IRssFeedParser;
    private readonly _config: YoutubeSettings;
    private readonly _videoDescriptionMaxLength: number;

    constructor(config: YoutubeSettings, aiService: YoutubeAiService) {
        this._aiService = aiService;
        this._rssFeedParser = new RssFeedParserFactory().create(config.rssVersion, [
            RssNamespaceProvider.find("Media-RSS"),
            RssNamespaceProvider.find("YouTube")
        ]);
        this._config = config;
        this._videoDescriptionMaxLength = PropertyService.getProperty(ScriptPropertiesKeyVault.youtubeVideoDescriptionMaxLength, 'number', PropertyType.Script);
    }

    log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }

    public getSummaries() : YoutubeSummary[] {
        const dateFormat = "yyyy.MM.dd";
        const periodEnd = new Date();
        const periodStart = new Date(periodEnd.getTime() - this._config.daysToCheck * 24 * 60 * 60 * 1000);

        this.log(LogSeverity.Info, `Summary collection initiated for the specified interval: From: ${DateHelper.getFormattedDateStr(periodStart, dateFormat)} | To: ${DateHelper.getFormattedDateStr(periodEnd, dateFormat)}`);

        const driveService = new YoutubeDriveService();
        const db = driveService.getClassifiedChannelDataBase();
        const summaries = this._config.topicSettings.topics
            .map(topic => this._createSummary(db, topic, periodStart, periodEnd))
            .filter(summary => summary.channels.length >= 1);
        const channelCount = summaries.reduce((sum, summary) => sum + summary.countChannels(), 0);
        const videoCount = summaries.reduce((sum, summary) => sum + summary.countVideos(), 0);
        
        summaries.forEach(s => s.logRandomChannelImageDataUrl());
        this._setRatingOnSummaryVideos(summaries);

        this.log(LogSeverity.Info, `Summary processing finished! - Total summaries: ${summaries.length} | Total channels: ${channelCount} | Total videos across all channels: ${videoCount}`);
        return summaries;
    }

    private _createSummary(db: ClassifiedYoutubeChannelDatabase, topic: IYoutubeTopic, periodStart: Date, periodEnd: Date) : YoutubeSummary {
        this.log(LogSeverity.Info, `Summary creation started for topic '${topic.name}'.`);
        
        const ignoredChannelIds = new Set(topic.ignoredChannelIds ?? []);
        const channelIds = db.getChannelIdsByTopic(topic.name)
            .filter(channelId => !ignoredChannelIds.has(channelId));

        this.log(LogSeverity.Info, `Found ${channelIds.length} relevant channels.`);
        
        const feedUrls = channelIds.map(channelId => this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId));
        const rootEls = this._rssFeedParser.getAllRootElementsParallel(feedUrls);
        const summary = new YoutubeSummary({
            channels: rootEls
                .map(r => this._createChannelData(r, periodStart, topic))
                .filter(c => c !== null),
            periodEndStr: ConverterService.getFormattedDateStr(periodEnd),
            periodStartStr: ConverterService.getFormattedDateStr(periodStart),
            topic: topic.name
        });

        this.log(LogSeverity.Info, `Summary creation finished for topic '${topic.name}'. - Channels: ${summary.countChannels()} | Videos: ${summary.countVideos()}`);
        return summary;
    }

    private _createChannelData(rootEl: XmlElement, periodStart: Date, topic: IYoutubeTopic) : IYoutubeChannelData | null {
        const channelId = "UC" + rootEl.getTextFromChildEl("yt:channelId");
        const authorEl = rootEl.getChild("author");
        const entries = this._getRelevantEntries(rootEl, periodStart, topic);

        if (entries.length == 0) return null;

        const channelImgs = this._fetchYoutubeChannelImageData(channelId);

        return {
            name: authorEl.getTextFromChildEl("name") ?? "",
            url: authorEl.getTextFromChildEl("uri") ?? "",
            avatarUrl: channelImgs.avatarUrl,
            bannerUrl: channelImgs.bannerUrl,
            videos: entries.map(e => this._createVideoData(e))
        };
    }

    private _collectShortElements(entries: XmlElement[]) : XmlElement[] {
        return entries.filter(e => {
            const videoUrl = this._rssFeedParser.getLinkFromElement(e).toLowerCase();
            return videoUrl.includes("shorts");
        });
    }

    private _hasBannedWord(entry: XmlElement, bannedWords: string[]) : boolean {
        bannedWords = bannedWords ?? [];
        const title = this._rssFeedParser.getTitleFromElement(entry).toLowerCase();

        return bannedWords.some(word => title.includes(word));
    }

    private _getRelevantEntries(rootEl: XmlElement, periodStart: Date, topic: IYoutubeTopic) : XmlElement[] {
        let entries = this._rssFeedParser.collectElements(rootEl)
            .filter(e => {
                const publishedDate = this._rssFeedParser.getDateFromElement(e);
                return publishedDate && publishedDate >= periodStart;
            });
        
        if (entries.length >= 1) {
            const shorts = this._collectShortElements(entries);
            const shortIds = shorts.map(s => s.id);

            entries = entries
                .filter(e => !shortIds.some(id => id === e.id))
                .filter(e => !this._hasBannedWord(e, topic.skipIfContains));

            if (topic.needShorts) {
                entries = [...entries, ...shorts];
            }
        }
        
        if (entries.length == 0) {
            return [];
        }
        else if (topic.aiFilter && topic.prompt) {
            try {
                const titles = entries.map(e => this._rssFeedParser.getTitleFromElement(e));
                const results = this._aiService.classifyMusicTitles(topic.prompt, titles);

                return entries.filter((_, i) => results[i] === true);
            }
            catch (ex) {
                this.log(LogSeverity.Warn, `AI filtering failed! Unfiltered videos are being processed for channel "${rootEl.getTextFromChildEl("title")}"`);
                return entries;
            }
        }

        return entries;
    }

    private _createVideoData(entryEl: XmlElement) : IYoutubeVideoData {
        const mediaEl = entryEl.getChild("media:group");
        const description = mediaEl.getTextFromChildEl("media:description") ?? "";
        const views = parseInt(
            mediaEl
                .getChild("media:community")
                .getValueFromChildEl("media:statistics", "views") ?? "0"
        );

        return {
            id: entryEl.getChild("yt:videoId").getText(),
            title: this._rssFeedParser.getTitleFromElement(entryEl),
            description: this._shortenText(description, this._videoDescriptionMaxLength),
            url: this._rssFeedParser.getLinkFromElement(entryEl),
            thumbnailUrl: mediaEl.getValueFromChildEl("media:thumbnail", "url") ?? "",
            views: this._formatViewsNumber(views),
            publishedDateStr: ConverterService.getFormattedDateStr(
                this._rssFeedParser.getDateFromElement(entryEl)
            )
        };
    }

    private _fetchYoutubeChannelImageData(channelId: string) : IYoutubeChannelImageData {
        const url = this._config.channelUrlTemplate.replace(HelperConstants.toBeReplaced, channelId);
        const response = UrlFetchApp.fetch(url, {
            muteHttpExceptions: true,
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const rawHtml = response.getContentText();
        const html = ConverterService.decodeEscaped(rawHtml);
        const avatarMatch = html.match(/"avatar":\{"thumbnails":\[\{"url":"(.*?)"/);
        const bannerMatch = html.match(/"imageBannerViewModel":\{"image":\{"sources":\[\{"url":"([^"]+)"/);

        return {
            channelId: channelId,
            avatarUrl: avatarMatch ? ConverterService.fixUrl(avatarMatch[1]) : "",
            bannerUrl: bannerMatch ? ConverterService.fixUrl(bannerMatch[1]) : ""
        } satisfies IYoutubeChannelImageData;
    }

    private _setRatingOnSummaryVideos(summaries: YoutubeSummary[]) : void {
        const videoIds = summaries
            .map(summary => summary.collectVideoIds())
            .reduce((acc, ids) => acc.concat(ids), []);
        const videoStats = new YoutubeService().getVideoStats(videoIds);

        for (const summary of summaries) {
            for (const channel of summary.channels) {
                for (const video of channel.videos) {
                    const videoStat = videoStats.find(stat => stat.videoId === video.id);

                    if (!videoStat) continue;

                    video.rating = this._computeStarRating(videoStat);
                }
            }
        }
    }

    private _shortenText(text: string, maxLength: number) : string {
        if (text.length <= maxLength) 
            return text;

        return text.substring(0, maxLength - 3) + "...";
    }

    private _formatViewsNumber(value: number): string {
        const units: [number, string][] = [
            [1_000_000_000, "B"],
            [1_000_000, "M"],
            [1000, "K"]
        ];

        for (const [limit, suffix] of units) {
            if (value >= limit) {
                const n = value / limit;
                return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)) + suffix;
            }
        }

        return value.toString();
    }

    private _computeStarRating(videoStatistics: IYoutubeVideoStatistics): number {
        const ratio = (videoStatistics.likeCount / videoStatistics.viewCount) * 100;
        const likeBoost = videoStatistics.likeCount / 50000;
        const commentBoost = videoStatistics.commentCount / 2000;
        const score = ratio + likeBoost + commentBoost;
        return Math.min(5, Math.max(0, score));
    }
}