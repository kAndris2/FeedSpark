import { IAppSettings } from "../Interfaces/IAppSettings";
import { ISelfConstructible } from "../Interfaces/ISelfConstructible";
import { IYoutubeSettings } from "../Interfaces/IYoutubeSettings";
import { YoutubeSettings } from "./YoutubeSettings";

export class AppSettings implements IAppSettings, ISelfConstructible<IAppSettings> {
    youtubeSettings!: IYoutubeSettings;

    constructor(settings?: IAppSettings) {
        if (!settings) return;

        this.youtubeSettings = new YoutubeSettings(settings.youtubeSettings);
    }

    createDefault(): IAppSettings {
        return {
            youtubeSettings: new YoutubeSettings().createDefault()
        };
    }
}