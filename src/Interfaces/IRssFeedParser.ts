import { XmlElement } from "../Models/XmlElement";

export interface IRssFeedParser {
    getAllRootElementsParallel(feedUrls: string[]) : XmlElement[];
    getElements(feedUrl: string) : XmlElement[];
    collectElements(root: XmlElement) : XmlElement[];
    getLinkFromElement(baseElement: XmlElement) : string;
    getTitleFromElement(baseElement: XmlElement) : string;
    getDateFromElement(baseElement: XmlElement) : Date;
}