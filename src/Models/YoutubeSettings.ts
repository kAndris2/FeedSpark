import { ISelfConstructible } from "../Interfaces/ISelfConstructible";
import { IYoutubeSettings } from "../Interfaces/IYoutubeSettings";

export class YoutubeSettings implements IYoutubeSettings, ISelfConstructible<IYoutubeSettings> {
    rssVersion!: string;
    daysToCheck!: number;
    skipVideoIfContains!: string[];
    
    constructor(settings?: IYoutubeSettings) {
        if (!settings) return;

        Object.assign(this, settings);
    }

    createDefault(): IYoutubeSettings {
        return {
            rssVersion: "Atom",
            daysToCheck: 0,
            skipVideoIfContains: []
        };
    }
}