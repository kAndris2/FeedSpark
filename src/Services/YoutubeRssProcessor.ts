import { IRssFeedParser } from "../Interfaces/IRssFeedParser";

export class YoutubeRssProcessor {
    private readonly _rssFeedParser: IRssFeedParser;

    constructor(rssFeedParser: IRssFeedParser) {
        this._rssFeedParser = rssFeedParser;
    }
}