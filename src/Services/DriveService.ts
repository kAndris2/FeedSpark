import { IAppSettings } from "../Interfaces/IAppSettings";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { AppSettings } from "../Models/AppSettings";
import { DriveServiceBase } from "./DriveServiceBase";
import { PropertyService, PropertyType } from "./PropertyService";

export class DriveService extends DriveServiceBase {
    private readonly _scriptFile: GoogleAppsScript.Drive.File;

    constructor() {
        super();
        this._scriptFile = this._getScriptFile();
    }

    public getConfiguration() : IAppSettings {
        const fileName = this.createFileName("config", "json");
        const config = this.get<IAppSettings>(fileName);

        if (config) {
            return new AppSettings(config);
        }

        const scriptFolder = this.organizeScript();
        const defaultPrimitiveConfig = this._createDefaultPrimitiveConfiguration(fileName, scriptFolder);

        return new AppSettings(defaultPrimitiveConfig);
    }

    protected organizeScript() : GoogleAppsScript.Drive.Folder {
        const rootFolderName = PropertyService.getProperty<string>(ScriptPropertiesKeyVault.appRootFolder, 'string', PropertyType.Script);
        const scriptFolder = this._createScriptFolder(`${rootFolderName}/${this._getScriptName}`);
        this._moveScriptFileToFolder(scriptFolder);

        return scriptFolder;
    }

    protected createFileName(name: string, extension: string) : string {
        const scriptName = this._getScriptName();
        const userId = PropertyService.getUserId();

        return `${scriptName}_${name}(${userId}).${extension}`;
    }

    private _getScriptName() : string {
        return this._scriptFile.getName();
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
        
    private _moveScriptFileToFolder(folder: GoogleAppsScript.Drive.Folder) : void {
        try {
            this._scriptFile.moveTo(folder);
        }
        catch(e) {
        }
    }

    private _getScriptFile() : GoogleAppsScript.Drive.File {
        const scriptId = ScriptApp.getScriptId();
        return DriveApp.getFileById(scriptId);
    }
}