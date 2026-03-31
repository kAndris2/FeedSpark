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

    getTitleFromElement(baseElement: GoogleAppsScript.XML_Service.Element): string {
        const title = this.getTextFromChildEl(baseElement, "title");

        if (!title) {
            throw new Error("The title can not be empty!");
        }
        
        return title;
    }

    getElements(feedUrl: string) : GoogleAppsScript.XML_Service.Element[] {
        const xml = UrlFetchApp.fetch(feedUrl).getContentText();
        const rootEl = this._getRootElement(xml);

        if (rootEl == null) return [];
        
        return this.collectElements(rootEl);
    }

    getLinkFromElement(baseElement: GoogleAppsScript.XML_Service.Element) : string {
        const url = this.getTextFromChildEl(baseElement, "link");

        if (!url) {
            throw new Error("The url can not be empty!");
        }

        return url;
    }

    getDateFromElement(baseElement: GoogleAppsScript.XML_Service.Element) : Date {
        const dateStr = this.getTextFromChildEl(baseElement, "pubDate");

        if (!dateStr) {
            throw new Error("The date can not be empty!");
        }

        return new Date(dateStr);
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