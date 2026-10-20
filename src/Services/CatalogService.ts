import { CatalogCategory } from "../Enums/CatalogCategory";
import { CatalogItem } from "../Interfaces/ICatalogItem";
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

    public getSummaries() : Map<string, CatalogItem[]> {
        const catalogItems = this._driveService.getCatalogItems();
        const summaryMap = new Map<string, CatalogItem[]>();

        Object.keys(CatalogCategory)
            .filter(key => isNaN(Number(key)))
            .forEach(key => {
                const category = CatalogCategory[key as keyof typeof CatalogCategory];

                const filteredItems = catalogItems.filter(c => c.category === category);
                this.log(LogSeverity.Info, `${CatalogCategory[category]} found: ${filteredItems.length}`);

                const categoryName = this._getCatalogItemCategoryName(category);
                summaryMap.set(categoryName, filteredItems);
            });
        
        return summaryMap;
    }

    private _getCatalogItemCategoryName(category: CatalogCategory) : string {
        try {
            switch (category) {
                case CatalogCategory.Movie: return "Movies";
                case CatalogCategory.Series: return "Series";
                default: throw new Error(`Unknown catalog category! - ${category}`);
            }
        }
        catch (e: any) {
            this.log(LogSeverity.Error, e.message);
            throw e;
        }
    }
}