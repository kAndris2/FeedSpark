export class XmlElement {
    private readonly _element: GoogleAppsScript.XML_Service.Element;
    private readonly _namespace: GoogleAppsScript.XML_Service.Namespace;

    constructor(element: GoogleAppsScript.XML_Service.Element, namespace: GoogleAppsScript.XML_Service.Namespace) {
        this._element = element;
        this._namespace = namespace;
    }

    public getChildren(name: string) : XmlElement[] {
        return this._element
            .getChildren(name, this._namespace)
            .map(el => new XmlElement(el, this._namespace))
    }

    public getChild(elementName: string) : XmlElement {
        const child = this._element
            .getChild(elementName, this._namespace);

        if (!child) {
            throw new Error(`The requested child can not be null! - '${elementName}'`);
        }
        
        return new XmlElement(child, this._namespace);
    }

    public getTextFromChildEl(elementName: string) : string | null {
        return this._element
            .getChild(elementName, this._namespace)
            ?.getText() ?? null;
    }

    public getValueFromChildEl(elementName: string, attribute: string) : string | null {
        return this._element
            .getChild(elementName, this._namespace)
            ?.getAttribute(attribute)
            ?.getValue() ?? null;
    }
}