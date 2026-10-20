import { CatalogCategory } from "../Enums/CatalogCategory";

export interface ICatalogItemMap {
    movie: IMovieCatalogItem;
    series: ISeriesCatalogItem;
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

export interface IVideoCatalogItem extends ICatalogItem {
    quality: string;
    posterUrl: string;
    rate: number;
    genres: string[];
    titleInfo: ITitleInfo;
    language: string;
}

export interface IMovieCatalogItem extends IVideoCatalogItem {
    releaseYear: number;
}

export interface ISeriesCatalogItem extends IVideoCatalogItem {
    season: string;
}

export interface ITitleInfo {
    primaryTitle: string;
    secondaryTitle: string;
}