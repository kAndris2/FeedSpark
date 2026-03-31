import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { IYoutubeVideoData } from "../Interfaces/IYoutubeVideoData";
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
        const feedUrls = this._config.channelIds.map(channelId => this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId));
        const rootEls = this._rssFeedParser.getAllRootElementsParallel(feedUrls);
        
        return rootEls
            .map(rootEl => this._rssFeedParser.collectElements(rootEl))
            .reduce((a, b) => a.concat(b), [])
            .map(entryEl => this._createYoutubeVideoData(entryEl))
    }

    private _createYoutubeVideoData(entryEl: XmlElement) : IYoutubeVideoData {
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
                url: authorEl.getTextFromChildEl("uri") ?? ""
            }
        };
    }
}