import { IClassifiedYoutubeChannelDatabase } from "../Interfaces/IClassifiedYoutubeChannelDatabase";
import { LogSeverity } from "../Interfaces/ILogable";
import { ClassifiedYoutubeChannelDatabase } from "../Models/ClassifiedYoutubeChannelDatabase";
import { DriveService } from "./DriveService";
import { GenericLogger } from "./GenericLogger";

export class YoutubeDriveService extends DriveService {
    private readonly _classifiedChannelsFilename: string = "youtube_channels";

    override log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }

    public getClassifiedChannelDataBase() : ClassifiedYoutubeChannelDatabase {
        const fileName = super.createFileName(this._classifiedChannelsFilename, "json");
        const db = super.get<IClassifiedYoutubeChannelDatabase>(fileName);

        if (!db) {
            this.moveFileToFolder(this.scriptFile, this.scriptFolder);
            this.scriptFolder.createFile(fileName, "", "text/plain");
            this.log(LogSeverity.Info, "Database created!");
        }
        else {
            this.log(LogSeverity.Info, "Database inicialized!");
        }

        return new ClassifiedYoutubeChannelDatabase(db);
    }

    public updateClassifiedChannelList(classifiedChannelDatabase: IClassifiedYoutubeChannelDatabase) : void {
        const fileName = super.createFileName(this._classifiedChannelsFilename, "json");
        super.setFileContent(fileName, classifiedChannelDatabase);
    }
}