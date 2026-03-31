import { IRssFeedParser } from "../Interfaces/IRssFeedParser";
import { AtomFeedParser } from "./AtomFeedParser";

export class RssFeedParserFactory {
    public create(version: string) : IRssFeedParser {
        const lowercaseVersion = version.toLowerCase();

        switch (lowercaseVersion) {
            case 'atom': return new AtomFeedParser();
        }

        throw new Error(`Invalid RSS version specified! - '${version}'`);
    }
}