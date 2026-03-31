import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { IYoutubeChannelImageData, IYoutubeVideoData } from "../Interfaces/IYoutubeVideoData";
import { HelperConstants } from "../Misc/HelperConstants";
import { XmlElement } from "../Models/XmlElement";
import { YoutubeSettings } from "../Models/YoutubeSettings";
import { RssFeedParserFactory } from "./RssFeedParserFactory";

export class YoutubeRssProcessor {
    private readonly _rssFeedParser: IRssFeedParser;
    private readonly _config: YoutubeSettings;

    constructor(config: YoutubeSettings) {
        this._rssFeedParser = new RssFeedParserFactory().create(config.rssVersion);
        this._config = config;
    }

    public getVideoData() : IYoutubeVideoData[] {
        const channelImgData = this._fetchYoutubeChannelImageData();
        const feedUrls = this._config.channelIds.map(channelId => this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId));
        const rootEls = this._rssFeedParser.getAllRootElementsParallel(feedUrls);
        
        return rootEls
            .map(rootEl => this._rssFeedParser.collectElements(rootEl))
            .reduce((a, b) => a.concat(b), [])
            .map(entryEl => {
                const channelId = entryEl.getTextFromChildEl("yt:channelId");
                return this._createYoutubeVideoData(entryEl, channelImgData.find(d => d.channelId == channelId));
            })
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
            const avatarRegex = /"avatar":\{"thumbnails":\[\{"url":"(.*?)"/;
            const bannerRegex = /"imageBannerViewModel":\{"image":\{"sources":\[\{"url":"([^"]+)"/;

            const avatarMatch = html.match(avatarRegex);
            const bannerMatch = html.match(bannerRegex);

            return {
                channelId: this._config.channelIds[i],
                avatarUrl: avatarMatch ? avatarMatch[1] : "",
                bannerUrl: bannerMatch ? bannerMatch[1] : ""
            } satisfies IYoutubeChannelImageData;
        });
    }
}