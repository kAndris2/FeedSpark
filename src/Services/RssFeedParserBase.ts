import { IRssFeedParser } from "../Interfaces/IRssFeedParser";

export abstract class RssFeedParserBase implements IRssFeedParser {
    protected readonly namespace: GoogleAppsScript.XML_Service.Namespace;

    constructor(namespaceStr: string) {
        this.namespace = XmlService.getNamespace(namespaceStr);
    }

    getAllRootElementsParallel(feedUrls: string[]): GoogleAppsScript.XML_Service.Element[] {
        const requests = feedUrls.map(feedUrl => ({
            url: feedUrl
        }));

        const responses = UrlFetchApp.fetchAll(requests);

        return responses
            .map(response => response.getContentText())
            .map(xml => this._getRootElement(xml))
            .filter(element => element !== null);
    }

    getTitleFromElement(baseElement: GoogleAppsScript.XML_Service.Element): string | null {
        return this.getTextFromChildEl(baseElement, "title");
    }

    getElements(feedUrl: string) : GoogleAppsScript.XML_Service.Element[] {
        const xml = UrlFetchApp.fetch(feedUrl).getContentText();
        const rootEl = this._getRootElement(xml);

        if (rootEl == null) return [];
        
        return this.collectElements(rootEl);
    }

    getLinkFromElement(baseElement: GoogleAppsScript.XML_Service.Element) : string | null {
        return this.getTextFromChildEl(baseElement, "link");
    }

    getDateFromElement(baseElement: GoogleAppsScript.XML_Service.Element) : Date | null {
        const dateStr = this.getTextFromChildEl(baseElement, "pubDate");
        return dateStr ? new Date(dateStr) : null;
    }

    abstract collectElements(root: GoogleAppsScript.XML_Service.Element) : GoogleAppsScript.XML_Service.Element[];

    protected getTextFromChildEl(baseElement: GoogleAppsScript.XML_Service.Element, elementName: string) : string | null {
        return baseElement
            .getChild(elementName, this.namespace)
            ?.getText() ?? null;
    }

    protected getValueFormChildEl(baseElement: GoogleAppsScript.XML_Service.Element, elementName: string, attribute: string) : string | null {
        return baseElement
            .getChild(elementName, this.namespace)
            ?.getAttribute(attribute)
            ?.getValue() ?? null;
    }

    private _getRootElement(xml: string) : GoogleAppsScript.XML_Service.Element | null {
        const document = XmlService.parse(xml);
        return document.getRootElement();
    }
}