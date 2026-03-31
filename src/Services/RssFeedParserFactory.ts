import { INamespace } from "../Interfaces/INamespace";
import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { AtomFeedParser } from "./AtomFeedParser";

export class RssFeedParserFactory {
    public create(version: string, namespaces: INamespace[]) : IRssFeedParser {
        const lowercaseVersion = version.toLowerCase();

        switch (lowercaseVersion) {
            case 'atom': return new AtomFeedParser(namespaces);
        }

        throw new Error(`Invalid RSS version specified! - '${version}'`);
    }
}