import { LogSeverity } from "../Interfaces/ILogable";
import { ILoggerSettings } from "../Interfaces/ILoggerSettings";
import { DateHelper } from "../Misc/DateHelper";
import { DriveServiceBase } from "./DriveServiceBase";
import { GenericLogger } from "./GenericLogger";

export class LoggerDriveService extends DriveServiceBase {
    private readonly _loggerSettings: ILoggerSettings;

    constructor(settings: ILoggerSettings) {
        super();
        this._loggerSettings = settings;
    }

    override log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }

    public finalize() : void {
        if (!this._loggerSettings.driveLogging) return;

        this._removeExpiredLogFiles();
        this._save();
    }

    protected override createFileName(name: string, extension: string): string {
        return `${this.getShortScriptName()}_${name}.${extension}`;
    }

    private _save() : void {
        const dateStr = DateHelper.getFormattedDateStr(new Date(), "yyyy.MM.dd");
        const fileName = this.createFileName(dateStr, "txt");
        let logFile = this.getLatestFile(fileName);

        if (!logFile) {
            const folder = this._getLogFolder();
            logFile = folder.createFile(fileName, "");
            this.log(LogSeverity.Info, `Log file created. - File: ${logFile.getName()} | Folder: ${folder.getName()}`);
        }

        const content = GenericLogger.logs.map(log => log.toString());
        this._setLogFileContent(logFile, content);
    }

    private _removeExpiredLogFiles() : void {
        if (this._loggerSettings.logExpiryInDays <= 0) return;

        const folder = this._getLogFolder();
        const files = folder.getFiles();

        const now = new Date();
        const threshold = new Date(now.getTime() - this._loggerSettings.logExpiryInDays * 24 * 60 * 60 * 1000);
        let count: number = 0;

        while (files.hasNext()) {
            const file = files.next();
            const lastUpdated = file.getLastUpdated();

            if (lastUpdated < threshold) {
                file.setTrashed(true);
                count++;
            }
        }

        this.log(LogSeverity.Info,
            count >= 1 ? 
                `Moved ${count} outdated log file(s) to the trash.`
                :
                'There are no expired files to remove.'
        );
    }

    private _setLogFileContent(file: GoogleAppsScript.Drive.File, content: string[]) : void {
        const oldContent = file.getBlob().getDataAsString();
        const newContent = oldContent + '\n' + content.join('\n');

        file.setContent(newContent);
    }

    private _getLogFolder() : GoogleAppsScript.Drive.Folder {
        return this.getOrCreateFolder(this.scriptFolderPath + "/logs");
    }
}