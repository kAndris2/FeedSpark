import { XmlElement } from "../Models/XmlElement";
import { RssFeedParserBase } from "./RssFeedParserBase";

export class AtomFeedParser extends RssFeedParserBase {
    constructor() {
        super("http://www.w3.org/2005/Atom", "http://search.yahoo.com/mrss/");
    }

    public override getLinkFromElement(baseElement: XmlElement): string {
        const url = baseElement.getValueFromChildEl("link", "href");

        if (!url) {
            throw new Error("The url can not be empty!");
        }

        return url;
    }

    public override getDateFromElement(baseElement: XmlElement): Date {
        const dateStr = baseElement.getTextFromChildEl("published");

        if (!dateStr) {
            throw new Error("The date can not be empty!");
        }

        return new Date(dateStr);
    }

    collectElements(root: XmlElement): XmlElement[] {
        return root.getChildren("entry");
    }
}