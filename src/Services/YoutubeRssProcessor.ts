import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { YoutubeSettings } from "../Models/YoutubeSettings";
import { RssFeedParserFactory } from "./RssFeedParserFactory";

export class YoutubeRssProcessor {
    private readonly _rssFeedParser: IRssFeedParser;
    private readonly _config: YoutubeSettings;

    constructor(config: YoutubeSettings) {
        this._rssFeedParser = new RssFeedParserFactory().create(config.rssVersion);
        this._config = config;
    }
}