import { IAppSettings } from "../Interfaces/IAppSettings";
import { IGeminiSettings } from "../Interfaces/IGeminiSettings";
import { ISelfConstructible } from "../Interfaces/ISelfConstructible";
import { IYoutubeSettings } from "../Interfaces/IYoutubeSettings";
import { GeminiSettings } from "./GeminiSettings";
import { YoutubeSettings } from "./YoutubeSettings";

export class AppSettings implements IAppSettings, ISelfConstructible<IAppSettings> {
    geminiSettings!: IGeminiSettings;
    youtubeSettings!: IYoutubeSettings;

    constructor(settings?: IAppSettings) {
        if (!settings) return;

        this.geminiSettings = new GeminiSettings(settings.geminiSettings);
        this.youtubeSettings = new YoutubeSettings(settings.youtubeSettings);
    }

    createDefault(): IAppSettings {
        return {
            geminiSettings: new GeminiSettings().createDefault(),
            youtubeSettings: new YoutubeSettings().createDefault()
        };
    }
}