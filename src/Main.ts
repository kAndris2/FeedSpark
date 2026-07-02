import { IAppSettings } from "./Interfaces/IAppSettings";
import { LogSeverity } from "./Interfaces/ILogable";
import { YoutubeSettings } from "./Models/YoutubeSettings";
import { DriveService } from "./Services/DriveService";
import { GenericLogger } from "./Services/GenericLogger";
import { LoggerDriveService } from "./Services/LoggerDriveService";
import { YoutubeAiService } from "./Services/YoutubeAiService";
import { YoutubeChannelClassifier } from "./Services/YoutubeChannelClassifier";
import { YoutubeMailService } from "./Services/YoutubeMailService";
import { YoutubeRssProcessor } from "./Services/YoutubeRssProcessor";
import { YoutubeService } from "./Services/YoutubeService";

let configBase: IAppSettings;
let loggerDriveService: LoggerDriveService;

class AppInitializer {
    static initialize() {
        configBase = new DriveService().getConfiguration();
        loggerDriveService = new LoggerDriveService(configBase.loggerSettings);
    }
}

function youtubeReaderEntry() {
    GenericLogger.addLog("Main", "Script started => youtubeReaderEntry", LogSeverity.Info);

    try {
        AppInitializer.initialize();

        const config = configBase.youtubeSettings;
        const aiService = new YoutubeAiService(configBase.aiStudioSettings);
        const youtubeService = new YoutubeService();
        const rssProcessor = new YoutubeRssProcessor(config as YoutubeSettings, aiService, youtubeService);
        const summaries = rssProcessor.getSummaries();

        const mailService = new YoutubeMailService();
        summaries.forEach(summary => mailService.sendSummary(summary));

        GenericLogger.addLog("Main", "Script finished successfully!", LogSeverity.Info);
    }
    catch (e) {
        GenericLogger.addLog("Main", "Script stopped because of an exception!", LogSeverity.Error);
    }
    finally {
        loggerDriveService.finalize();
    }
}

function youtubeTopicSelectorEntry() {
    GenericLogger.addLog("Main", "Script started => youtubeTopicSelectorEntry", LogSeverity.Info);

    try {
        AppInitializer.initialize();

        const config = configBase.youtubeSettings.topicSettings;
        const aiService = new YoutubeAiService(configBase.aiStudioSettings);
        const channelClassifier = new YoutubeChannelClassifier(config, aiService);

        channelClassifier.classifyChannels();

        GenericLogger.addLog("Main", "Script finished successfully!", LogSeverity.Info);
    }
    catch (e) {
        GenericLogger.addLog("Main", "Script stopped because of an exception!", LogSeverity.Error);
    }
    finally {
        loggerDriveService.finalize();
    }
}