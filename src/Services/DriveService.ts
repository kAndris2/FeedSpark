import { IAppSettings } from "../Interfaces/IAppSettings";
import { AppSettings } from "../Models/AppSettings";
import { PropertyService } from "./PropertyService";

export class DriveService {
    public getConfiguration() : IAppSettings {
        const userId = PropertyService.getUserId();
        const scriptName = this._getScriptName();
        const fileName = scriptName + `_config(${userId}).json`;
        const file = this._getLatestConfigFile(fileName);

        if (file) {
            const primitiveConfig = JSON.parse(file.getBlob().getDataAsString()) as IAppSettings;
            return new AppSettings(primitiveConfig);
        }

        const defaultPrimitiveConfig = this._createDefaultPrimitiveConfiguration(fileName, scriptName);
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

    private _createDefaultPrimitiveConfiguration(fileName: string, scriptName: string) : IAppSettings {
        const scriptFolder = this._createScriptFolder(`Apps/${scriptName}`);
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

    private _getScriptName() : string {
        const scriptId = ScriptApp.getScriptId();
        
        return DriveApp
            .getFileById(scriptId)
            .getName();
    }
}