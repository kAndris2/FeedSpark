import { IAiStudioSettings } from "./IAiStudioSettings";
import { IYoutubeSettings } from "./IYoutubeSettings";

export interface IAppSettings {
    aiStudioSettings: IAiStudioSettings;
    youtubeSettings: IYoutubeSettings;
}