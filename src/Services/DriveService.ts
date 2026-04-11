import { IAppSettings } from "../Interfaces/IAppSettings";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { AppSettings } from "../Models/AppSettings";
import { PropertyService } from "./PropertyService";

export class DriveService {
    public getConfiguration() : IAppSettings {
        const userId = PropertyService.getUserId();
        const scriptFile = this._getScriptFile();
        const scriptName = scriptFile.getName();
        const fileName = scriptName + `_config(${userId}).json`;
        const file = this._getLatestConfigFile(fileName);

        if (file) {
            const primitiveConfig = JSON.parse(file.getBlob().getDataAsString()) as IAppSettings;
            return new AppSettings(primitiveConfig);
        }

        const scriptFolder = this._createScriptFolder(`${ScriptPropertiesKeyVault.appRootFolder}/${scriptName}`);
        const defaultPrimitiveConfig = this._createDefaultPrimitiveConfiguration(fileName, scriptFolder);
        this._moveScriptFileToFolder(scriptFolder, scriptFile);
        return new AppSettings(defaultPrimitiveConfig);
    }

    private _getLatestConfigFile(fileName: string) : GoogleAppsScript.Drive.File | null {
        const files = DriveApp.getFilesByName(fileName);
        let latest: GoogleAppsScript.Drive.File | null = null;

        while (files.hasNext()) { 
            const file = files.next();

            if (!latest || file.getLastUpdated() > latest.getLastUpdated()) {
                latest = file;
            }
        }

        return latest;
    }

    private _createDefaultPrimitiveConfiguration(fileName: string, scriptFolder: GoogleAppsScript.Drive.Folder) : IAppSettings {
        const defaultConfig = new AppSettings().createDefault();
        scriptFolder.createFile(fileName, JSON.stringify(defaultConfig), "text/plain");

        return defaultConfig;
    }

    private _createScriptFolder(path: string) {
        const parts = path.split('/');
        let current = DriveApp.getRootFolder();

        parts.forEach(name => {
            let folders = current.getFoldersByName(name);
            current = folders.hasNext() ? folders.next() : current.createFolder(name);
        });

        return current;
    }

        
    private _moveScriptFileToFolder(folder: GoogleAppsScript.Drive.Folder, file: GoogleAppsScript.Drive.File) : void {
        folder.addFile(file);
        DriveApp.getRootFolder().removeFile(file);
    }

    private _getScriptFile() : GoogleAppsScript.Drive.File {
        const scriptId = ScriptApp.getScriptId();
        return DriveApp.getFileById(scriptId);
    }
}