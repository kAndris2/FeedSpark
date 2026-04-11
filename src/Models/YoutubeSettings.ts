import { ISelfConstructible } from "../Interfaces/ISelfConstructible";
import { IYoutubeSettings } from "../Interfaces/IYoutubeSettings";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { PropertyService, PropertyType } from "../Services/PropertyService";

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
        this.feedUrlTemplate = PropertyService.getProperty(ScriptPropertiesKeyVault.youtubeFeedUrlTemplate, "string", PropertyType.Script);
        this.channelUrlTemplate = PropertyService.getProperty(ScriptPropertiesKeyVault.youtubeChannelUrlTemplate, "string", PropertyType.Script);
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