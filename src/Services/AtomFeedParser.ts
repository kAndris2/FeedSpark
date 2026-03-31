import { RssFeedParserBase } from "./RssFeedParserBase";

export class AtomFeedParser extends RssFeedParserBase {
    constructor() {
        super("http://www.w3.org/2005/Atom");
    }

    public override getLinkFromElement(baseElement: GoogleAppsScript.XML_Service.Element): string {
        const url = this.getValueFormChildEl(baseElement, "link", "href");

        if (!url) {
            throw new Error("The url can not be empty!");
        }

        return url;
    }

    public override getDateFromElement(baseElement: GoogleAppsScript.XML_Service.Element): Date {
        const dateStr = this.getTextFromChildEl(baseElement, "published");

        if (!dateStr) {
            throw new Error("The date can not be empty!");
        }

        return new Date(dateStr);
    }

    collectElements(root: GoogleAppsScript.XML_Service.Element): GoogleAppsScript.XML_Service.Element[] {
        return root.getChildren("entry", this.namespace);
    }
}