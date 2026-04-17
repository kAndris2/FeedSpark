import { INamespace } from "../Interfaces/INamespace";
import { XmlElementInfo } from "../Interfaces/XmlElementInfo";

export class XmlElement {
    public readonly id: string;
    private readonly _element: GoogleAppsScript.XML_Service.Element;
    private readonly _namespaces: INamespace[];

    constructor(element: GoogleAppsScript.XML_Service.Element, namespaces: INamespace[]) {
        this.id = Utilities.getUuid();
        this._element = element;
        this._namespaces = namespaces;
    }

    public getChildren(elementName: string) : XmlElement[] {
        const elementInfo = this._getElementInfo(elementName);

        return this._element
            .getChildren(elementInfo.elementName, elementInfo.namespace as GoogleAppsScript.XML_Service.Namespace)
            .map(el => new XmlElement(el, this._namespaces))
    }

    public getChild(elementName: string) : XmlElement {
        const elementInfo = this._getElementInfo(elementName);

        const child = this._element
            .getChild(elementInfo.elementName, elementInfo.namespace as GoogleAppsScript.XML_Service.Namespace);

        if (!child) {
            throw new Error(`The requested child can not be null! - '${elementName}'`);
        }
        
        return new XmlElement(child, this._namespaces);
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
        if (!elementName.includes(":")) {
            return {
                elementName: elementName,
                namespace: this._namespaces.find(n => n.prefix === "")?.namespace ?? null
            };
        }

        for (const namespaceInfo of this._namespaces.filter(n => n.prefix !== "")) {
            if (elementName.includes(namespaceInfo.prefix)) {
                return {
                    elementName: elementName.replace(namespaceInfo.prefix + ":", ""),
                    namespace: namespaceInfo.namespace
                };
            }
        }

        throw new Error(`Unhandled namespace on element! - '${elementName}'`);
    }
}