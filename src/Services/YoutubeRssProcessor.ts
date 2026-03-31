import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { IYoutubeChannelImageData, IYoutubeVideoData } from "../Interfaces/IYoutubeVideoData";
import { HelperConstants } from "../Misc/HelperConstants";
import { RssNamespaceProvider } from "../Misc/RssNamespaceProvider";
import { XmlElement } from "../Models/XmlElement";
import { YoutubeSettings } from "../Models/YoutubeSettings";
import { RssFeedParserFactory } from "./RssFeedParserFactory";

export class YoutubeRssProcessor {
    private readonly _rssFeedParser: IRssFeedParser;
    private readonly _config: YoutubeSettings;

    constructor(config: YoutubeSettings) {
        this._rssFeedParser = new RssFeedParserFactory().create(config.rssVersion, [
            RssNamespaceProvider.find("Media-RSS"),
            RssNamespaceProvider.find("YouTube")
        ]);
        this._config = config;
    }

    public getVideoData() : IYoutubeVideoData[] {
        const channelImgData = this._fetchYoutubeChannelImageData();
        const feedUrls = this._config.channelIds.map(channelId => this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId));
        const rootEls = this._rssFeedParser.getAllRootElementsParallel(feedUrls);
        const startDate = new Date(new Date().getTime() - this._config.daysToCheck * 24 * 60 * 60 * 1000);
        
        return rootEls
            .map(rootEl => this._rssFeedParser.collectElements(rootEl))
            .reduce((a, b) => a.concat(b), [])
            .map(entryEl => {
                const channelId = entryEl.getTextFromChildEl("yt:channelId");
                return this._createYoutubeVideoData(entryEl, channelImgData.find(d => d.channelId == channelId));
            })
            .filter(videoData => videoData.publishedDate > startDate);
    }

    private _createYoutubeVideoData(entryEl: XmlElement, channelImageData: IYoutubeChannelImageData | undefined) : IYoutubeVideoData {
        const mediaGroupEl = entryEl.getChild("media:group");
        const authorEl = entryEl.getChild("author");

        return {
            title: this._rssFeedParser.getTitleFromElement(entryEl),
            description: mediaGroupEl.getTextFromChildEl("media:description") ?? "",
            url: this._rssFeedParser.getLinkFromElement(entryEl),
            thumbnailUrl: mediaGroupEl.getValueFromChildEl("media:thumbnail", "url") ?? "",
            publishedDate: this._rssFeedParser.getDateFromElement(entryEl),
            author: {
                name: authorEl.getTextFromChildEl("name") ?? "",
                url: authorEl.getTextFromChildEl("uri") ?? "",
                avatarUrl: channelImageData?.avatarUrl ?? "",
                bannerUrl: channelImageData?.bannerUrl ?? ""
            }
        };
    }

    private _fetchYoutubeChannelImageData() : IYoutubeChannelImageData[] {
        const requests = this._config.channelIds.map(channelId => ({
            url: this._config.channelUrlTemplate.replace(HelperConstants.toBeReplaced, channelId),
            muteHttpExceptions: true,
            headers: { "User-Agent": "Mozilla/5.0" }
        }));

        const responses = UrlFetchApp.fetchAll(requests);

        return responses.map((response, i) => {
            const html = response.getContentText();
            const avatarMatch = html.match(/"avatar":\{"thumbnails":\[\{"url":"(.*?)"/);
            const bannerMatch = html.match(/"imageBannerViewModel":\{"image":\{"sources":\[\{"url":"([^"]+)"/);

            return {
                channelId: this._config.channelIds[i],
                avatarUrl: avatarMatch ? avatarMatch[1] : "",
                bannerUrl: bannerMatch ? bannerMatch[1] : ""
            } satisfies IYoutubeChannelImageData;
        });
    }
}