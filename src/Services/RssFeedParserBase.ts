import { INamespace } from "../Interfaces/INamespace";
import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { XmlElement } from "../Models/XmlElement";

export abstract class RssFeedParserBase implements IRssFeedParser {
    private readonly _namespaces: INamespace[];

    constructor(namespaces: INamespace[]) {
        this._namespaces = namespaces;
    }

    getAllRootElementsParallel(feedUrls: string[]): XmlElement[] {
        const requests = feedUrls.map(feedUrl => ({
            url: feedUrl
        }));

        const responses = UrlFetchApp.fetchAll(requests);

        return responses
            .map(response => response.getContentText())
            .map(xml => this._getRootElement(xml))
            .filter(element => element !== null);
    }

    getTitleFromElement(baseElement: XmlElement): string {
        const title = baseElement.getTextFromChildEl("title");

        if (!title) {
            throw new Error("The title can not be empty!");
        }
        
        return title;
    }

    getElements(feedUrl: string) : XmlElement[] {
        const xml = UrlFetchApp.fetch(feedUrl).getContentText();
        const rootEl = this._getRootElement(xml);

        if (rootEl == null) return [];
        
        return this.collectElements(rootEl);
    }

    getLinkFromElement(baseElement: XmlElement) : string {
        const url = baseElement.getTextFromChildEl("link");

        if (!url) {
            throw new Error("The url can not be empty!");
        }

        return url;
    }

    getDateFromElement(baseElement: XmlElement) : Date {
        const dateStr = baseElement.getTextFromChildEl("pubDate");

        if (!dateStr) {
            throw new Error("The date can not be empty!");
        }

        return new Date(dateStr);
    }

    abstract collectElements(root: XmlElement) : XmlElement[];

    private _getRootElement(xml: string) : XmlElement | null {
        const document = XmlService.parse(xml);
        const rootEl = document.getRootElement();

        return rootEl ? new XmlElement(rootEl, this._namespaces) : null;
    }
}