import { ISelfConstructible } from "../Interfaces/ISelfConstructible";
import { IYoutubeSettings } from "../Interfaces/IYoutubeSettings";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { ConverterService } from "../Services/ConverterService";

export class YoutubeSettings implements IYoutubeSettings, ISelfConstructible<IYoutubeSettings> {
    feedUrlTemplate!: string;
    channelUrlTemplate!: string;
    rssVersion!: string;
    daysToCheck!: number;
    skipVideoIfContains!: string[];
    ignoredChannelIds!: string[];
    
    constructor(settings?: IYoutubeSettings) {
        if (!settings) return;

        Object.assign(this, settings);
        this.feedUrlTemplate = ConverterService.getConvertedProperty(ScriptPropertiesKeyVault.youtubeFeedUrlTemplate, "string");
        this.channelUrlTemplate = ConverterService.getConvertedProperty(ScriptPropertiesKeyVault.youtubeChannelUrlTemplate, "string");
    }

    createDefault(): IYoutubeSettings {
        return {
            rssVersion: "Atom",
            daysToCheck: 0,
            skipVideoIfContains: [],
            ignoredChannelIds: []
        };
    }
}