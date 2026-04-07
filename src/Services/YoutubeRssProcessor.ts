import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { IYoutubeChannelData, IYoutubeChannelImageData, IYoutubeSummary, IYoutubeVideoData } from "../Interfaces/IYoutubeSummary";
import { HelperConstants } from "../Misc/HelperConstants";
import { RssNamespaceProvider } from "../Misc/RssNamespaceProvider";
import { XmlElement } from "../Models/XmlElement";
import { YoutubeSettings } from "../Models/YoutubeSettings";
import { ConverterService } from "./ConverterService";
import { GeminiService } from "./GeminiService";
import { RssFeedParserFactory } from "./RssFeedParserFactory";
import { YoutubeChannelProvider } from "./YoutubeChannelProvider";

export class YoutubeRssProcessor {
    private readonly _geminiService: GeminiService;
    private readonly _channelProvider: YoutubeChannelProvider;
    private readonly _rssFeedParser: IRssFeedParser;
    private readonly _config: YoutubeSettings;

    constructor(config: YoutubeSettings, geminiService: GeminiService) {
        this._geminiService = geminiService;
        this._channelProvider = new YoutubeChannelProvider();
        this._rssFeedParser = new RssFeedParserFactory().create(config.rssVersion, [
            RssNamespaceProvider.find("Media-RSS"),
            RssNamespaceProvider.find("YouTube")
        ]);
        this._config = config;
    }

    public getSummary() : IYoutubeSummary {
        const channelIds = this._channelProvider.getChannelIds(this._config.ignoredChannelIds);
        const feedUrls = channelIds.map(channelId => this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId));
        const rootEls = this._rssFeedParser.getAllRootElementsParallel(feedUrls);
        const periodEnd = new Date();
        const periodStart = new Date(periodEnd.getTime() - this._config.daysToCheck * 24 * 60 * 60 * 1000);
        
        return {
            channels: rootEls
                .map(r => this._createChannelData(r, periodStart))
                .filter(c => c !== null),
            periodEndStr: ConverterService.getFormattedDateStr(periodEnd),
            periodStartStr: ConverterService.getFormattedDateStr(periodStart)
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

        const titles = entries.map(e => this._rssFeedParser.getTitleFromElement(e));
        const prompt = `
            You are a classifier. Your task is to determine whether each YouTube video title in the list below represents music-related content.

            Mark a title as TRUE only if:
            - it is clearly music content (song, track, single, remix, mashup, album, EP, mixtape, DJ set, mix, lofi mix, beat tape, official audio, official music video).

            Mark a title as FALSE if:
            - it is a livestream, live broadcast, live recording, live session, live performance, concert recording, premiere, or anything indicating a live event.
            - it is not music-related (vlog, commentary, podcast, tutorial, tech video, gaming, reaction, news, review, educational content).

            Output format:
            Return ONLY a JSON array of booleans, where each element corresponds to the input title at the same index.
            Example: [true, false, true]

            Do not include explanations or any additional text.

            Titles:
            ${JSON.stringify(titles, null, 2)}
        `;
        const geminiResults = this._geminiService.classify(prompt);

        return entries.filter((_, i) => geminiResults[i] === true);
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