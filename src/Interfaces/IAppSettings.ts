import { IGeminiSettings } from "./IGeminiSettings";
import { IYoutubeSettings } from "./IYoutubeSettings";

export interface IAppSettings {
    geminiSettings: IGeminiSettings;
    youtubeSettings: IYoutubeSettings;
}