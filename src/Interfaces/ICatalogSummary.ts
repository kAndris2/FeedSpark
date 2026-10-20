import { IMovieCatalogItem, ISeriesCatalogItem } from "./ICatalogItem";

export interface ICatalogSummary {
    movies: IMovieCatalogItem[];
    series: ISeriesCatalogItem[];
}