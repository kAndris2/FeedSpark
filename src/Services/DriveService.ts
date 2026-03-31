import { IAppSettings } from "../Interfaces/IAppSettings";
import { AppSettings } from "../Models/AppSettings";

export class DriveService {
    public getConfiguration() : IAppSettings {
        const fileName = this._getScriptName() + "_config.json";
        const file = this._getLatestConfigFile(fileName);

        if (file) {
            const primitiveConfig = JSON.parse(file.getBlob().getDataAsString()) as IAppSettings;
            return new AppSettings(primitiveConfig);
        }

        const defaultPrimitiveConfig = this._createDefaultPrimitiveConfiguration(fileName);
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

    private _createDefaultPrimitiveConfiguration(fileName: string) : IAppSettings {
        const defaultConfig = new AppSettings().createDefault();
        DriveApp.createFile(fileName, JSON.stringify(defaultConfig), "text/plain");

        return defaultConfig;
    }

    private _getScriptName() : string {
        const scriptId = ScriptApp.getScriptId();
        
        return DriveApp
            .getFileById(scriptId)
            .getName();
    }
}