import { CatalogCategory } from "../Enums/CatalogCategory";

export interface ICatalogItemMap {
    movie: IMovieCatalogItem;
    series: ISeriesCatalogItem;
    music: IMusicCatalogItem;
    language: ILanguageCatalogItem;
    catalog: ICatalogItem;
}

export type CatalogItem = {
    [K in keyof ICatalogItemMap]:
        ICatalogItemMap[K] & { $type: K }
}[keyof ICatalogItemMap];

export interface ICatalogItem {
    originalTitle: string;
    category: CatalogCategory;
    publishedDate: Date;
}

export interface ILanguageCatalogItem extends ICatalogItem {
    language: string;
}

export interface IVideoCatalogItem extends ILanguageCatalogItem {
    quality: string;
    posterUrl: string;
    rate: number;
    genres: string[];
    titleInfo: ITitleInfo;
}

export interface IMovieCatalogItem extends IVideoCatalogItem {
    releaseYear: number;
}

export interface ISeriesCatalogItem extends IVideoCatalogItem {
    season: string;
}

export interface IMusicCatalogItem extends ILanguageCatalogItem {
    releaseYear: number;
}

export interface ITitleInfo {
    primaryTitle: string;
    secondaryTitle: string;
}