import { YoutubeSettings } from "./Models/YoutubeSettings";
import { DriveService } from "./Services/DriveService";
import { YoutubeAiService } from "./Services/YoutubeAiService";
import { YoutubeMailService } from "./Services/YoutubeMailService";
import { YoutubeRssProcessor } from "./Services/YoutubeRssProcessor";

const configBase = new DriveService().getConfiguration();

function youtubeReaderEntry() {
    const config = configBase.youtubeSettings;
    const aiService = new YoutubeAiService(configBase.aiStudioSettings);
    const rssProcessor = new YoutubeRssProcessor(config as YoutubeSettings, aiService);
    const summary = rssProcessor.getSummary();

    if (summary.channels.length == 0) return;

    const mailService = new YoutubeMailService();
    mailService.sendSummary(summary);
}