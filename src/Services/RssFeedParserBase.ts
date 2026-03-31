import { IRssFeedParser } from "../Interfaces/IRssFeedParser";

export abstract class RssFeedParserBase implements IRssFeedParser {
    protected readonly namespace: GoogleAppsScript.XML_Service.Namespace;

    constructor(namespaceStr: string) {
        this.namespace = XmlService.getNamespace(namespaceStr);
    }

    getTitleFromElement(baseElement: GoogleAppsScript.XML_Service.Element): string | null {
        return this.getTextFromChildEl(baseElement, "title");
    }

    getElements(feedUrl: string) : GoogleAppsScript.XML_Service.Element[] {
        const xml = UrlFetchApp.fetch(feedUrl).getContentText();
        const document = XmlService.parse(xml);
        const root = document.getRootElement();

        if (root == null) return [];
        
        return this.collectElements(root);
    }

    getLinkFromElement(baseElement: GoogleAppsScript.XML_Service.Element) : string | null {
        return this.getTextFromChildEl(baseElement, "link");
    }

    getDateFromElement(baseElement: GoogleAppsScript.XML_Service.Element) : Date | null {
        const dateStr = this.getTextFromChildEl(baseElement, "pubDate");
        return dateStr ? new Date(dateStr) : null;
    }

    protected abstract collectElements(root: GoogleAppsScript.XML_Service.Element) : GoogleAppsScript.XML_Service.Element[];

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
}