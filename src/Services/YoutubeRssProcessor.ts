import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { IYoutubeChannelData, IYoutubeEncodedImage, IYoutubeVideoData } from "../Interfaces/IYoutubeVideoData";
import { HelperConstants } from "../Misc/HelperConstants";
import { RssNamespaceProvider } from "../Misc/RssNamespaceProvider";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { XmlElement } from "../Models/XmlElement";
import { YoutubeSettings } from "../Models/YoutubeSettings";
import { ConverterService } from "./ConverterService";
import { HttpRequestManager } from "./HttpRequestManager";
import { RssFeedParserFactory } from "./RssFeedParserFactory";

type ChannelEncodedImages = [
    avatar: IYoutubeEncodedImage,
    banner: IYoutubeEncodedImage,
    thumbnails: IYoutubeEncodedImage[]
];

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
        const entries = this._rssFeedParser.collectElements(rootEl)
            .filter(e => {
                const publishedDate = this._rssFeedParser.getDateFromElement(e);
                return publishedDate && publishedDate >= startDate;
            });
        const [avatar, banner, thumbnails] = this._getChannelEncodedImages(channelId, entries);

        return {
            name: authorEl.getTextFromChildEl("name") ?? "",
            url: authorEl.getTextFromChildEl("uri") ?? "",
            avatar: avatar,
            banner: banner,
            videos: entries.map((e, i) => this._createVideoData(e, thumbnails[i]))
        };
    }

    private _createVideoData(entryEl: XmlElement, thumbnail: IYoutubeEncodedImage) : IYoutubeVideoData {
        return {
            title: this._rssFeedParser.getTitleFromElement(entryEl),
            description: entryEl
                .getChild("media:group")
                .getTextFromChildEl("media:description") ?? "",
            url: this._rssFeedParser.getLinkFromElement(entryEl),
            thumbnail: thumbnail,
            publishedDate: this._rssFeedParser.getDateFromElement(entryEl)
        };
    }

    private _getChannelEncodedImages(channelId: string, entries: XmlElement[]) : ChannelEncodedImages {
        const channelImgUrls = [
            ConverterService.getConvertedProperty<string>(ScriptPropertiesKeyVault.youtubeChannelAvatarUrlTemplate, "string")
                .replace(HelperConstants.toBeReplaced, channelId as string),
            ConverterService.getConvertedProperty<string>(ScriptPropertiesKeyVault.youtubeChannelBannerUrlTemplate, "string")
                .replace(HelperConstants.toBeReplaced, channelId as string)
        ];
        const thumbnailUrls = entries.map(e => {
            const mediaGroupEl = e.getChild("media:group");
            return mediaGroupEl.getValueFromChildEl("media:thumbnail", "url") ?? "";
        });

        const urls = [...channelImgUrls, ...thumbnailUrls];
        const encodedImages = this._createEncodedChannelImages(urls);

        const avatar = encodedImages[0];
        const banner = encodedImages[1];
        const thumbnails = encodedImages.slice(2);

        return [avatar, banner, thumbnails];
    }

    private _createEncodedChannelImages(urls: string[]) : IYoutubeEncodedImage[] {
        const blobs = HttpRequestManager.fetchBlobsParallel(urls, {
            muteHttpExceptions: true,
            followRedirects: true
        });

        return blobs.map(b => {
            return {
                bytes: Utilities.base64Encode(b.getBytes()),
                contentType: b.getContentType()
            }
        });
    }
}