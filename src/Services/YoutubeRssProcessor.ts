import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { IYoutubeChannelData, IYoutubeEncodedImage, IYoutubeVideoData } from "../Interfaces/IYoutubeVideoData";
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

    public getChannels() : IYoutubeChannelData[] {
        const feedUrls = this._config.channelIds.map(channelId => this._config.feedUrlTemplate.replace(HelperConstants.toBeReplaced, channelId));
        const rootEls = this._rssFeedParser.getAllRootElementsParallel(feedUrls);
        
        return rootEls
            .map(r => this._createChannelData(r))
            .filter(c => c.videos.length >= 1);
    }

    private _createChannelData(rootEl: XmlElement) : IYoutubeChannelData {
        const startDate = new Date(new Date().getTime() - this._config.daysToCheck * 24 * 60 * 60 * 1000);
        const channelId = "UC" + rootEl.getTextFromChildEl("yt:channelId");
        const authorEl = rootEl.getChild("author");
        const entries = this._rssFeedParser.collectElements(rootEl);

        return {
            name: authorEl.getTextFromChildEl("name") ?? "",
            url: authorEl.getTextFromChildEl("uri") ?? "",
            avatar: this._getEncodedChannelImage(
                ConverterService.getConvertedProperty<string>(ScriptPropertiesKeyVault.youtubeChannelAvatarUrlTemplate, "string")
                    .replace(HelperConstants.toBeReplaced, channelId as string)
            ),
            banner: this._getEncodedChannelImage(
                ConverterService.getConvertedProperty<string>(ScriptPropertiesKeyVault.youtubeChannelBannerUrlTemplate, "string")
                    .replace(HelperConstants.toBeReplaced, channelId as string)
            ),
            videos: entries
                .map(e => this._createVideoData(e))
                .filter(v => v.publishedDate > startDate)
        };
    }

    private _createVideoData(entryEl: XmlElement) : IYoutubeVideoData {
        const mediaGroupEl = entryEl.getChild("media:group");

        return {
            title: this._rssFeedParser.getTitleFromElement(entryEl),
            description: mediaGroupEl.getTextFromChildEl("media:description") ?? "",
            url: this._rssFeedParser.getLinkFromElement(entryEl),
            thumbnail: this._getEncodedChannelImage(
                mediaGroupEl.getValueFromChildEl("media:thumbnail", "url") ?? ""
            ),
            publishedDate: this._rssFeedParser.getDateFromElement(entryEl)
        };
    }

    private _getEncodedChannelImage(url: string) : IYoutubeEncodedImage {
        const response = UrlFetchApp.fetch(url, {
            muteHttpExceptions: true,
            followRedirects: true
        });

        const blob = response.getBlob();

        return {
            bytes: Utilities.base64Encode(blob.getBytes()),
            contentType: blob.getContentType()
        }
    }
}