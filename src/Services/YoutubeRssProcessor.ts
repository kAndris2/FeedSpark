import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { IYoutubeVideoData } from "../Interfaces/IYoutubeVideoData";
import { HelperConstants } from "../Misc/HelperConstants";
import { YoutubeSettings } from "../Models/YoutubeSettings";
import { RssFeedParserFactory } from "./RssFeedParserFactory";

export class YoutubeRssProcessor {
    private readonly _rssFeedParser: IRssFeedParser;
    private readonly _config: YoutubeSettings;

    constructor(config: YoutubeSettings) {
        this._rssFeedParser = new RssFeedParserFactory().create(config.rssVersion);
        this._config = config;
    }

    public getItems() : IYoutubeVideoData[] {
        const result: IYoutubeVideoData[] = [];
        const feedUrls = this._config.channelIds.map(channelId => this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId));
        const rootEls = this._rssFeedParser.getAllRootElementsParallel(feedUrls);
        const entryEls = rootEls.map(rootEl => this._rssFeedParser.collectElements(rootEl));

        

        return result;
    }
}