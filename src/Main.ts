import { YoutubeSettings } from "./Models/YoutubeSettings";
import { DriveService } from "./Services/DriveService";
import { YoutubeMailService } from "./Services/YoutubeMailService";
import { YoutubeRssProcessor } from "./Services/YoutubeRssProcessor";

const configBase = new DriveService().getConfiguration();

function youtubeReaderEntry() {
    const config = configBase.youtubeSettings;
    const rssProcessor = new YoutubeRssProcessor(config as YoutubeSettings);
    const channels = rssProcessor.getChannels();

    if (channels.length == 0) return;

    const mailService = new YoutubeMailService();
    mailService.sendSummary(channels);
}