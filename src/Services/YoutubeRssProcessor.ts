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
        const elements = this._fetchElements();
        

        /* for (const channelId of this._config.channelIds) {
            const feedUrl = this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId);
            const elements = this._rssFeedParser.getElements(feedUrl);
        } */

        return result;
    }

    private _fetchElements() {
        const requests = this._config.channelIds.map(channelId => ({
            url: this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId)
        }));

        const responses = UrlFetchApp.fetchAll(requests);

        return responses.map(r => r.getContentText());
    }
}