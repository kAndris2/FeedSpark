import { ILogable, LogSeverity } from "../Interfaces/ILogable";
import { GenericLogger } from "./GenericLogger";

export abstract class DriveServiceBase implements ILogable {
    protected readonly scriptFolder: GoogleAppsScript.Drive.Folder;
    protected readonly scriptFile: GoogleAppsScript.Drive.File;
    protected readonly scriptFolderPath: string;

    constructor() {
        this.scriptFile = this._getScriptFile();

        this.scriptFolderPath = `Apps/${this.scriptFile.getName()}`;
        this.scriptFolder = this.getOrCreateFolder(this.scriptFolderPath);
    }

    log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }

    protected setFileContent(fileName: string, content: any) : void {
        const file = this.getLatestFile(fileName);

        if (!file) {
            throw new Error(`The requested file does not exist! - ${fileName}`);
        }

        file.setContent(JSON.stringify(content, null, 2));
    }

    protected get<T>(fileName: string) : T | null {
        try {
            this.log(LogSeverity.Info, `Fetching file... - '${fileName}'`);

            const file = this.getLatestFile(fileName);

            if (!file)
                throw new Error(`File not found! - '${fileName}'`);

            const result = JSON.parse(file.getBlob().getDataAsString()) as T;
            this.log(LogSeverity.Info, "File found and successfully parsed!");

            return result;
        }
        catch (e: any) {
            this.log(LogSeverity.Warn, e.message);
            return null;
        }
    }

    protected moveFileToFolder(file: GoogleAppsScript.Drive.File, folder: GoogleAppsScript.Drive.Folder) : void {
        try {
            file.moveTo(folder);
            this.log(LogSeverity.Info, `File '${file.getName()}' has been moved into folder '${folder.getName()}'.`);
        }
        catch(e: any) {
            this.log(LogSeverity.Warn, `An unhandled exception occured when moving file '${file.getName()}' into folder '${folder.getName()}'. Ex.: ${e.message}`);
        }
    }

    protected createFileName(name: string, extension: string) : string {
        return `${this.scriptFile.getName()}_${name}.${extension}`;
    }

    protected getOrCreateFolder(path: string): GoogleAppsScript.Drive.Folder {
        return this._getFolder(path) ?? this._createFolder(path);
    }

    protected getLatestFile(fileName: string) : GoogleAppsScript.Drive.File | null {
        const user = Session.getActiveUser();
        const files = DriveApp.getFilesByName(fileName);
        let latest: GoogleAppsScript.Drive.File | null = null;

        while (files.hasNext()) { 
            const file = files.next();
            const owner = file.getOwner();

            if (owner.getEmail() != user.getEmail()) continue;

            if (!latest || file.getLastUpdated() > latest.getLastUpdated()) {
                latest = file;
            }
        }

        return latest;
    }

    private _getFolder(path: string): GoogleAppsScript.Drive.Folder | null {
        const parts = path.split('/');
        let current = DriveApp.getRootFolder();

        for (const name of parts) {
            const folders = current.getFoldersByName(name);

            if (!folders.hasNext()) {
                this.log(LogSeverity.Info, `Folder not found! - Path: '${path}'`);
                return null;
            }

            current = folders.next();
        }

        this.log(LogSeverity.Info, `Folder found! - Path: '${path}'`);
        return current;
    }

    private _createFolder(path: string): GoogleAppsScript.Drive.Folder {
        const parts = path.split('/');
        let current = DriveApp.getRootFolder();

        for (const name of parts) {
            const folders = current.getFoldersByName(name);

            if (folders.hasNext()) {
                current = folders.next();
            } 
            else {
                current = current.createFolder(name);
                this.log(LogSeverity.Info, `Folder created! - Path: ${path}`);
            }
        }

        return current;
    }

    private _getScriptFile() : GoogleAppsScript.Drive.File {
        const scriptId = ScriptApp.getScriptId();
        return DriveApp.getFileById(scriptId);
    }
}