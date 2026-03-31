import { INamespace } from "../Interfaces/INamespace";

const RssNamespaceStorage : INamespace[] = [
    {
        name: "Atom",
        prefix: "",
        namespace: XmlService.getNamespace("http://www.w3.org/2005/Atom")
    },
    {
        name: "Media-RSS",
        prefix: "media",
        namespace: XmlService.getNamespace("http://search.yahoo.com/mrss/")
    },
    {
        name: "YouTube",
        prefix: "yt",
        namespace: XmlService.getNamespace("http://www.youtube.com/xml/schemas/2015")
    }
];

export class RssNamespaceProvider {
    public static find(name: string) : INamespace {
        const lowercaseName = name.toLowerCase();

        const namespace = RssNamespaceStorage.find(n => n.name.toLowerCase() === lowercaseName);

        if (!namespace) {
            throw new Error(`Unknown namespace! - '${name}'`);
        }

        return namespace;
    }
}