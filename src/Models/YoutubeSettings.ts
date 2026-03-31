import { ISelfConstructible } from "../Interfaces/ISelfConstructible";
import { IYoutubeSettings } from "../Interfaces/IYoutubeSettings";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { ConverterService } from "../Services/ConverterService";

export class YoutubeSettings implements IYoutubeSettings, ISelfConstructible<IYoutubeSettings> {
    feedUrl!: string;
    rssVersion!: string;
    daysToCheck!: number;
    skipVideoIfContains!: string[];
    channelIds!: string[];
    
    constructor(settings?: IYoutubeSettings) {
        if (!settings) return;

        Object.assign(this, settings);
        this.feedUrl = ConverterService.getConvertedProperty(ScriptPropertiesKeyVault.youtubeFeedUrlTemplate, 'string');
    }

    createDefault(): IYoutubeSettings {
        return {
            rssVersion: "Atom",
            daysToCheck: 0,
            skipVideoIfContains: [],
            channelIds: []
        };
    }
}