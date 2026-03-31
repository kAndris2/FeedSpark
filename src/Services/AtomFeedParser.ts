import { RssFeedParserBase } from "./RssFeedParserBase";

export class AtomFeedParser extends RssFeedParserBase {
    constructor() {
        super("http://www.w3.org/2005/Atom");
    }

    public override getLinkFromElement(baseElement: GoogleAppsScript.XML_Service.Element): string | null {
        return this.getValueFormChildEl(baseElement, "link", "href")
    }

    public override getDateFromElement(baseElement: GoogleAppsScript.XML_Service.Element): Date | null {
        const dateStr = this.getTextFromChildEl(baseElement, "published");
        return dateStr ? new Date(dateStr) : null;
    }

    protected collectItems(root: GoogleAppsScript.XML_Service.Element): GoogleAppsScript.XML_Service.Element[] {
        return root.getChildren("entry", this.namespace);
    }
}