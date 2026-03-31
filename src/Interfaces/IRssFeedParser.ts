export interface IRssFeedParser {
    getAllRootElementsParallel(feedUrls: string[]) : GoogleAppsScript.XML_Service.Element[];
    getElements(feedUrl: string) : GoogleAppsScript.XML_Service.Element[];
    collectElements(root: GoogleAppsScript.XML_Service.Element) : GoogleAppsScript.XML_Service.Element[];
    getLinkFromElement(baseElement: GoogleAppsScript.XML_Service.Element) : string | null;
    getTitleFromElement(baseElement: GoogleAppsScript.XML_Service.Element) : string | null;
    getDateFromElement(baseElement: GoogleAppsScript.XML_Service.Element) : Date | null;
}