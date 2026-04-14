import { IClassifiedYoutubeChannel } from "../Interfaces/IClassifiedYoutubeChannel";
import { DriveService } from "./DriveService";

export class YoutubeDriveService extends DriveService {
    private readonly _classifiedChannelsFilename: string = "youtube_channels";

    public getClassifiedChannelList() : IClassifiedYoutubeChannel[] {
        const fileName = super.createFileName(this._classifiedChannelsFilename, "json");
        const config = super.get<IClassifiedYoutubeChannel[]>(fileName);

        if (!config) {
            const scriptFolder = super.organizeScript();
            scriptFolder.createFile(fileName, "", "text/plain");
        }

        return config ?? [];
    }

    public updateClassifiedChannelList(classifiedChannels: IClassifiedYoutubeChannel[]) : void {
        const fileName = super.createFileName(this._classifiedChannelsFilename, "json");
        super.setFileContent(fileName, classifiedChannels);
    }
}