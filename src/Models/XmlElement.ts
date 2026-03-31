import { XmlElementInfo } from "../Interfaces/XmlElementInfo";

export class XmlElement {
    private readonly _element: GoogleAppsScript.XML_Service.Element;
    private readonly _namespace: GoogleAppsScript.XML_Service.Namespace;
    private readonly _mediaNamespace: GoogleAppsScript.XML_Service.Namespace;

    constructor(element: GoogleAppsScript.XML_Service.Element, namespace: GoogleAppsScript.XML_Service.Namespace, mediaNamespace: GoogleAppsScript.XML_Service.Namespace) {
        this._element = element;
        this._namespace = namespace;
        this._mediaNamespace = mediaNamespace;
    }

    public getChildren(elementName: string) : XmlElement[] {
        const elementInfo = this._getElementInfo(elementName);

        return this._element
            .getChildren(elementInfo.elementName, elementInfo.namespace)
            .map(el => new XmlElement(el, this._namespace, this._mediaNamespace))
    }

    public getChild(elementName: string) : XmlElement {
        const elementInfo = this._getElementInfo(elementName);

        const child = this._element
            .getChild(elementInfo.elementName, elementInfo.namespace);

        if (!child) {
            throw new Error(`The requested child can not be null! - '${elementName}'`);
        }
        
        return new XmlElement(child, this._namespace, this._mediaNamespace);
    }

    public getTextFromChildEl(elementName: string) : string | null {
        return this
            .getChild(elementName)
            ?.getText() ?? null;
    }

    public getValueFromChildEl(elementName: string, attribute: string) : string | null {
        return this
            .getChild(elementName)
            ?.getAttribute(attribute)
            ?.getValue() ?? null;
    }

    public getText() : string {
        return this._element.getText();
    }

    public getAttribute(attribute: string) : GoogleAppsScript.XML_Service.Attribute | null {
        return this._element.getAttribute(attribute);
    }

    private _getElementInfo(elementName: string) : XmlElementInfo {
        if (elementName.includes("media")) {
            return {
                elementName: elementName.replace("media:", ""),
                namespace: this._mediaNamespace
            };
        }

        return {
            elementName: elementName,
            namespace: this._namespace
        };
    }
}