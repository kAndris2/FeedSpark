import { IYoutubeSettings } from "../Interfaces/IYoutubeSettings";

export class YoutubeSettings implements IYoutubeSettings {
    rssVersion!: string;
    daysToCheck!: number;
    skipVideoIfContains!: string[];
    
    constructor(settings?: IYoutubeSettings) {
        if (!settings) return;

        Object.assign(this, settings);
    }
}