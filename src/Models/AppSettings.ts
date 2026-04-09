import { IAppSettings } from "../Interfaces/IAppSettings";
import { IAiStudioSettings } from "../Interfaces/IAiStudioSettings";
import { ISelfConstructible } from "../Interfaces/ISelfConstructible";
import { IYoutubeSettings } from "../Interfaces/IYoutubeSettings";
import { AiStudioSettings } from "./AiStudioSettings";
import { YoutubeSettings } from "./YoutubeSettings";

export class AppSettings implements IAppSettings, ISelfConstructible<IAppSettings> {
    aiStudioSettings!: IAiStudioSettings;
    youtubeSettings!: IYoutubeSettings;

    constructor(settings?: IAppSettings) {
        if (!settings) return;

        this.aiStudioSettings = new AiStudioSettings(settings.aiStudioSettings);
        this.youtubeSettings = new YoutubeSettings(settings.youtubeSettings);
    }

    createDefault(): IAppSettings {
        return {
            aiStudioSettings: new AiStudioSettings().createDefault(),
            youtubeSettings: new YoutubeSettings().createDefault()
        };
    }
}