import { IAiStudioSettings } from "./IAiStudioSettings";
import { ILoggerSettings } from "./ILoggerSettings";
import { IYoutubeSettings } from "./IYoutubeSettings";

export interface IAppSettings {
    loggerSettings: ILoggerSettings;
    aiStudioSettings: IAiStudioSettings;
    youtubeSettings: IYoutubeSettings;
}