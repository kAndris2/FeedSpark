import { CatalogCategory } from "../Enums/CatalogCategory";
import { CatalogItem } from "../Interfaces/ICatalogItem";
import { ICatalogSummary } from "../Interfaces/ICatalogSummary";
import { ILogable, LogSeverity } from "../Interfaces/ILogable";
import { DriveService } from "./DriveService";
import { GenericLogger } from "./GenericLogger";

export class CatalogService implements ILogable {
    private readonly _driveService: DriveService;

    constructor(driveService: DriveService) {
        this._driveService = driveService;
    }

    log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }

    public getSummaries() : ICatalogSummary {
        const catalogItems = this._driveService.getCatalogItems();

        return {
            movies: this._catalogFilter(catalogItems, CatalogCategory.Movie),
            series: this._catalogFilter(catalogItems, CatalogCategory.Series),
            music: this._catalogFilter(catalogItems, CatalogCategory.Music),
            languages: this._catalogFilter(catalogItems, CatalogCategory.Language),
            catalogs: this._catalogFilter(catalogItems, CatalogCategory.Catalog),
        };
    }

    private _catalogFilter<T>(catalogItems: CatalogItem[], category: CatalogCategory) : T[] {
        const result = catalogItems.filter(c => c.category === category) as T[];

        this.log(LogSeverity.Info, `${CatalogCategory[category]} found: ${result.length}`);

        return result;
    }
}