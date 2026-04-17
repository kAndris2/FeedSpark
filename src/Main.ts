import { YoutubeSettings } from "./Models/YoutubeSettings";
import { DriveService } from "./Services/DriveService";
import { YoutubeAiService } from "./Services/YoutubeAiService";
import { YoutubeChannelClassifier } from "./Services/YoutubeChannelClassifier";
import { YoutubeMailService } from "./Services/YoutubeMailService";
import { YoutubeRssProcessor } from "./Services/YoutubeRssProcessor";

const configBase = new DriveService().getConfiguration();

function youtubeReaderEntry() {
    const config = configBase.youtubeSettings;
    const aiService = new YoutubeAiService(configBase.aiStudioSettings);
    const rssProcessor = new YoutubeRssProcessor(config as YoutubeSettings, aiService);
    const summaries = rssProcessor.getSummaries();

    const mailService = new YoutubeMailService();
    summaries.forEach(summary => mailService.sendSummary(summary))
}

function youtubeTopicSelectorEntry() {
    const config = configBase.youtubeSettings.topicSettings;
    const aiService = new YoutubeAiService(configBase.aiStudioSettings);
    const channelClassifier = new YoutubeChannelClassifier(config, aiService);

    channelClassifier.classifyChannels();
}