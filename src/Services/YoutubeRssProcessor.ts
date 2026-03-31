import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { IYoutubeSettings } from "../Interfaces/IYoutubeSettings";
import { RssFeedParserFactory } from "./RssFeedParserFactory";

export class YoutubeRssProcessor {
    private readonly _rssFeedParser: IRssFeedParser;
    private readonly _config: IYoutubeSettings;

    constructor(config: IYoutubeSettings) {
        this._rssFeedParser = new RssFeedParserFactory().create(config.rssVersion);
        this._config = config;
    }
}