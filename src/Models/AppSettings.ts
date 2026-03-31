import { IAppSettings } from "../Interfaces/IAppSettings";
import { IYoutubeSettings } from "../Interfaces/IYoutubeSettings";
import { YoutubeSettings } from "./YoutubeSettings";

export class AppSettings implements IAppSettings {
    youtubeSettings!: IYoutubeSettings;

    constructor(settings?: IAppSettings) {
        if (!settings) return;

        this.youtubeSettings = new YoutubeSettings(settings.youtubeSettings);
    }
}