import { IClassifiedYoutubeChannelDatabase } from "../Interfaces/IClassifiedYoutubeChannelDatabase";
import { ClassifiedYoutubeChannelDatabase } from "../Models/ClassifiedYoutubeChannelDatabase";
import { DriveService } from "./DriveService";

export class YoutubeDriveService extends DriveService {
    private readonly _classifiedChannelsFilename: string = "youtube_channels";

    public getClassifiedChannelDataBase() : ClassifiedYoutubeChannelDatabase {
        const fileName = super.createFileName(this._classifiedChannelsFilename, "json");
        const config = super.get<IClassifiedYoutubeChannelDatabase>(fileName);

        if (!config) {
            const scriptFolder = super.organizeScript();
            scriptFolder.createFile(fileName, "", "text/plain");
        }

        return new ClassifiedYoutubeChannelDatabase(config);
    }

    public updateClassifiedChannelList(classifiedChannelDatabase: IClassifiedYoutubeChannelDatabase) : void {
        const fileName = super.createFileName(this._classifiedChannelsFilename, "json");
        super.setFileContent(fileName, classifiedChannelDatabase);
    }
}