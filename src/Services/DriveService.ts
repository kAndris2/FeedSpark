import { IAppSettings } from "../Interfaces/IAppSettings";
import { CatalogItem } from "../Interfaces/ICatalogItem";
import { LogSeverity } from "../Interfaces/ILogable";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { AppSettings } from "../Models/AppSettings";
import { DriveServiceBase } from "./DriveServiceBase";
import { GenericLogger } from "./GenericLogger";

export class DriveService extends DriveServiceBase {
    override log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }

    public getCatalogItems() : CatalogItem[] {
        const catalogItems = this.get<CatalogItem[]>(ScriptPropertiesKeyVault.catalogStorageFilename);

        if (!catalogItems)
            throw new Error("No catalog items found!");

        return catalogItems;
    }

    public getConfiguration() : IAppSettings {
        const fileName = this.createFileName("config", "json");
        const config = this.get<IAppSettings>(fileName);

        if (config) {
            this.log(LogSeverity.Info, "Configuration inicialized!");
            return new AppSettings(config);
        }

        this.moveFileToFolder(this.scriptFile, this.scriptFolder);
        const defaultPrimitiveConfig = this._createDefaultPrimitiveConfiguration(fileName);

        return new AppSettings(defaultPrimitiveConfig);
    }

    private _createDefaultPrimitiveConfiguration(fileName: string) : IAppSettings {
        const defaultConfig = new AppSettings().createDefault();
        this.scriptFolder.createFile(fileName, JSON.stringify(defaultConfig), "text/plain");

        this.log(LogSeverity.Info, "Default configuration created!");
        return defaultConfig;
    }
}