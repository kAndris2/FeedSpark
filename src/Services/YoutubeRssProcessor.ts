import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { IYoutubeTopic } from "../Interfaces/IYoutubeSettings";
import { IYoutubeChannelData, IYoutubeChannelImageData, IYoutubeSummary, IYoutubeVideoData } from "../Interfaces/IYoutubeSummary";
import { HelperConstants } from "../Misc/HelperConstants";
import { RssNamespaceProvider } from "../Misc/RssNamespaceProvider";
import { ClassifiedYoutubeChannelDatabase } from "../Models/ClassifiedYoutubeChannelDatabase";
import { XmlElement } from "../Models/XmlElement";
import { YoutubeSettings } from "../Models/YoutubeSettings";
import { ConverterService } from "./ConverterService";
import { RssFeedParserFactory } from "./RssFeedParserFactory";
import { YoutubeAiService } from "./YoutubeAiService";
import { YoutubeDriveService } from "./YoutubeDriveService";

export class YoutubeRssProcessor {
    private readonly _aiService: YoutubeAiService;
    private readonly _rssFeedParser: IRssFeedParser;
    private readonly _config: YoutubeSettings;

    constructor(config: YoutubeSettings, aiService: YoutubeAiService) {
        this._aiService = aiService;
        this._rssFeedParser = new RssFeedParserFactory().create(config.rssVersion, [
            RssNamespaceProvider.find("Media-RSS"),
            RssNamespaceProvider.find("YouTube")
        ]);
        this._config = config;
    }

    public getSummaries() : IYoutubeSummary[] {
        const periodEnd = new Date();
        const periodStart = new Date(periodEnd.getTime() - this._config.daysToCheck * 24 * 60 * 60 * 1000);

        const driveService = new YoutubeDriveService();
        const db = driveService.getClassifiedChannelDataBase();

        return this._config.topicSettings.topics
            .map(topic => this._createSummary(db, topic, periodStart, periodEnd))
            .filter(summary => summary.channels.length >= 1);
    }

    private _createSummary(db: ClassifiedYoutubeChannelDatabase, topic: IYoutubeTopic, periodStart: Date, periodEnd: Date) : IYoutubeSummary {
        const channelIds = db.getChannelIdsByTopic(topic.name);
        const feedUrls = channelIds.map(channelId => this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId));
        const rootEls = this._rssFeedParser.getAllRootElementsParallel(feedUrls);

        return {
            channels: rootEls
                .map(r => this._createChannelData(r, periodStart, topic))
                .filter(c => c !== null),
            periodEndStr: ConverterService.getFormattedDateStr(periodEnd),
            periodStartStr: ConverterService.getFormattedDateStr(periodStart),
            topic: topic.name
        };
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

            if (topic.needShorts) {
                entries = [
                    ...entries
                        .filter(e => !shortIds.some(id => id === e.id))
                        .filter(e => !this._hasBannedWord(e, topic.skipIfContains)), 
                    ...shorts
                ];
            }
            else {
                entries = entries
                    .filter(e => !shortIds.some(id => id === e.id))
                    .filter(e => !this._hasBannedWord(e, topic.skipIfContains));
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
                return entries;
            }
        }

        return entries;
    }

    private _createVideoData(entryEl: XmlElement) : IYoutubeVideoData {
        const mediaEl = entryEl.getChild("media:group");

        return {
            title: this._rssFeedParser.getTitleFromElement(entryEl),
            description: mediaEl.getTextFromChildEl("media:description") ?? "",
            url: this._rssFeedParser.getLinkFromElement(entryEl),
            thumbnailUrl: mediaEl.getValueFromChildEl("media:thumbnail", "url") ?? "",
            views: parseInt(
                mediaEl
                    .getChild("media:community")
                    .getValueFromChildEl("media:statistics", "views") ?? "0"
            ),
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
}