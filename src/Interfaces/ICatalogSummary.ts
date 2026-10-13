import { ICatalogItem, ILanguageCatalogItem, IMovieCatalogItem, IMusicCatalogItem, ISeriesCatalogItem } from "./ICatalogItem";

export interface ICatalogSummary {
    movies: IMovieCatalogItem[];
    series: ISeriesCatalogItem[];
    music: IMusicCatalogItem[];
    languages: ILanguageCatalogItem[];
    catalogs: ICatalogItem[];
}