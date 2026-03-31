import { DriveService } from "./Services/DriveService";
import { YoutubeRssProcessor } from "./Services/YoutubeRssProcessor";

const configBase = new DriveService().getConfiguration();

function youtubeReaderEntry() {
    const config = configBase.youtubeSettings;
    const rssProcessor = new YoutubeRssProcessor(config);
}