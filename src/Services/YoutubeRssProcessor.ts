import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
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

        const topics = this._config.topicSettings.topics.map(topic => topic.name);
        const driveService = new YoutubeDriveService();
        const db = driveService.getClassifiedChannelDataBase();

        return topics.map(topic => this._createSummary(db, topic, periodStart, periodEnd))
            .filter(summary => summary.channels.length >= 1);
    }

    private _createSummary(db: ClassifiedYoutubeChannelDatabase, topic: string, periodStart: Date, periodEnd: Date) : IYoutubeSummary {
        const channelIds = db.getChannelIdsByTopic(topic);
        const feedUrls = channelIds.map(channelId => this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId));
        const rootEls = this._rssFeedParser.getAllRootElementsParallel(feedUrls);

        return {
            channels: rootEls
                .map(r => this._createChannelData(r, periodStart))
                .filter(c => c !== null),
            periodEndStr: ConverterService.getFormattedDateStr(periodEnd),
            periodStartStr: ConverterService.getFormattedDateStr(periodStart),
            topic: topic
        };
    }

    private _createChannelData(rootEl: XmlElement, periodStart: Date) : IYoutubeChannelData | null {
        const channelId = "UC" + rootEl.getTextFromChildEl("yt:channelId");
        const authorEl = rootEl.getChild("author");
        const entries = this._getRelevantEntries(rootEl, periodStart);

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

    private _getRelevantEntries(rootEl: XmlElement, periodStart: Date) : XmlElement[] {
        const entries = this._rssFeedParser.collectElements(rootEl)
            .filter(e => {
                const publishedDate = this._rssFeedParser.getDateFromElement(e);
                return publishedDate && publishedDate >= periodStart;
            })
            .filter(e => {
                const videoUrl = this._rssFeedParser.getLinkFromElement(e);
                return !videoUrl.includes("shorts");
            });
        
        if (entries.length == 0) return [];

        try {
            const titles = entries.map(e => this._rssFeedParser.getTitleFromElement(e));
            const results = this._aiService.classifyMusicTitles(titles);

            return entries.filter((_, i) => results[i] === true);
        }
        catch (ex) {
            return entries;
        }
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