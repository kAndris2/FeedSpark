import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { IYoutubeVideoData } from "../Interfaces/IYoutubeVideoData";
import { HelperConstants } from "../Misc/HelperConstants";
import { RssNamespaceProvider } from "../Misc/RssNamespaceProvider";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { XmlElement } from "../Models/XmlElement";
import { YoutubeSettings } from "../Models/YoutubeSettings";
import { ConverterService } from "./ConverterService";
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
        const feedUrls = this._config.channelIds.map(channelId => this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId));
        const rootEls = this._rssFeedParser.getAllRootElementsParallel(feedUrls);
        const startDate = new Date(new Date().getTime() - this._config.daysToCheck * 24 * 60 * 60 * 1000);
        
        return rootEls
            .map(rootEl => this._rssFeedParser.collectElements(rootEl))
            .reduce((a, b) => a.concat(b), [])
            .map(entryEl => {
                return this._createYoutubeVideoData(entryEl);
            })
            .filter(videoData => videoData.publishedDate > startDate);
    }

    private _createYoutubeVideoData(entryEl: XmlElement) : IYoutubeVideoData {
        const channelId = entryEl.getTextFromChildEl("yt:channelId");
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
                avatarUrl: ConverterService.getConvertedProperty<string>(ScriptPropertiesKeyVault.youtubeChannelAvatarUrlTemplate, "string").replace(HelperConstants.toBeReplaced, channelId as string),
                bannerUrl: ConverterService.getConvertedProperty<string>(ScriptPropertiesKeyVault.youtubeChannelBannerUrlTemplate, "string").replace(HelperConstants.toBeReplaced, channelId as string)
            }
        };
    }
}