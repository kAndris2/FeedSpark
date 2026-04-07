import { YoutubeSettings } from "./Models/YoutubeSettings";
import { DriveService } from "./Services/DriveService";
import { GeminiService } from "./Services/GeminiService";
import { YoutubeMailService } from "./Services/YoutubeMailService";
import { YoutubeRssProcessor } from "./Services/YoutubeRssProcessor";

const configBase = new DriveService().getConfiguration();

function youtubeReaderEntry() {
    const config = configBase.youtubeSettings;
    const geminiService = new GeminiService(configBase.geminiSettings);
    const rssProcessor = new YoutubeRssProcessor(config as YoutubeSettings, geminiService);
    const summary = rssProcessor.getSummary();

    if (summary.channels.length == 0) return;

    const mailService = new YoutubeMailService();
    mailService.sendSummary(summary);
}