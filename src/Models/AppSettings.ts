import { IAppSettings } from "../Interfaces/IAppSettings";
import { IAiStudioSettings } from "../Interfaces/IAiStudioSettings";
import { ISelfConstructible } from "../Interfaces/ISelfConstructible";
import { IYoutubeSettings } from "../Interfaces/IYoutubeSettings";
import { AiStudioSettings } from "./AiStudioSettings";
import { YoutubeSettings } from "./YoutubeSettings";
import { ILoggerSettings } from "../Interfaces/ILoggerSettings";
import { LoggerSettings } from "./LoggerSettings";

export class AppSettings implements IAppSettings, ISelfConstructible<IAppSettings> {
    loggerSettings!: ILoggerSettings;
    aiStudioSettings!: IAiStudioSettings;
    youtubeSettings!: IYoutubeSettings;

    constructor(settings?: IAppSettings) {
        if (!settings) return;

        this.loggerSettings = new LoggerSettings(settings.loggerSettings);
        this.aiStudioSettings = new AiStudioSettings(settings.aiStudioSettings);
        this.youtubeSettings = new YoutubeSettings(settings.youtubeSettings);
    }

    createDefault(): IAppSettings {
        return {
            loggerSettings: new LoggerSettings().createDefault(),
            aiStudioSettings: new AiStudioSettings().createDefault(),
            youtubeSettings: new YoutubeSettings().createDefault()
        };
    }
}