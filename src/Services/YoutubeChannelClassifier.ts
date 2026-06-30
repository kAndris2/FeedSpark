import { IClassifiedYoutubeChannelDatabase } from "../Interfaces/IClassifiedYoutubeChannelDatabase";
import { ILogable, LogSeverity } from "../Interfaces/ILogable";
import { IYoutubeChannel } from "../Interfaces/IYoutubeChannel";
import { IYoutubeTopicSettings } from "../Interfaces/IYoutubeSettings";
import { ClassifiedYoutubeChannelDatabase } from "../Models/ClassifiedYoutubeChannelDatabase";
import { GenericLogger } from "./GenericLogger";
import { YoutubeAiService } from "./YoutubeAiService";
import { YoutubeDriveService } from "./YoutubeDriveService";

export class YoutubeChannelClassifier implements ILogable {
    private readonly _settings: IYoutubeTopicSettings;
    private readonly _aiService:  YoutubeAiService;
    private readonly _driveService: YoutubeDriveService;

    constructor(settings: IYoutubeTopicSettings, aiService: YoutubeAiService) {
        this._settings = settings;
        this._aiService = aiService;
        this._driveService = new YoutubeDriveService();
    }

    log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }

    public classifyChannels() : void {
        this.log(LogSeverity.Info, `Channel classification started.`);

        const subscribedChannels = this._getSubscribedChannels();
        this.log(LogSeverity.Info, `Found ${subscribedChannels.length} subscribed channels.`);

        const classifiedChannelDatabase = this._driveService.getClassifiedChannelDataBase();
        const requiredTopics = this._settings.topics.map(t => t.name);
        this.log(LogSeverity.Info, `Found ${requiredTopics.length} required topics. - ${requiredTopics.join(', ')}`);

        classifiedChannelDatabase.normalize(subscribedChannels.map(c => c.id), requiredTopics);
        const registeredTopics = classifiedChannelDatabase.getTopics();

        if (registeredTopics.length >= 1) {
            const allTopicsRegistered = requiredTopics.every(function(requiredTopic) {
                return registeredTopics.indexOf(requiredTopic) !== -1;
            });

            if (!allTopicsRegistered) {
                const missingTopics = requiredTopics.filter(t => registeredTopics.indexOf(t) === -1);
                this.log(LogSeverity.Info, `Channel re-registration started due to unprocessed topics. - Missing topics: ${missingTopics.join(', ')}`);
                this._reRegisterChannels(classifiedChannelDatabase, subscribedChannels, requiredTopics);
                return;
            }
        }

        const relevantYoutubeChannels = subscribedChannels.filter(subscribedChannel => !classifiedChannelDatabase.has(subscribedChannel.id));
        
        if (relevantYoutubeChannels.length == 0) {
            this.log(LogSeverity.Info, "Channel classification skipped, because no relevant channels found!");
            return;
        }
        else {
            this.log(LogSeverity.Info, `Found ${relevantYoutubeChannels.length} relevant youtube channels to classify. - ${relevantYoutubeChannels.map(c => c.name).join(', ')}`);
        }

        this._registerNewChannels(classifiedChannelDatabase, relevantYoutubeChannels, requiredTopics);

        this.log(LogSeverity.Info, `Channel classification finished successfully!`);
    }

    private _registerNewChannels(db: ClassifiedYoutubeChannelDatabase, newChannels: IYoutubeChannel[], topics: string[]) : void {
        const result = this._aiService.classifyChannels(newChannels.map(c => c.name), topics);
        const mappedResult = this._mapChannelNamesToIds(result, newChannels);
        db.addRange(mappedResult);

        const channelInfos = Object.keys(mappedResult).map(key => mappedResult[key]);
        const channelInfosStr = channelInfos.map(c => `${c.channel}->${c.topics.join('/')}`);
        this.log(LogSeverity.Info, `Classified channels added to the db. - ${channelInfosStr.join(', ')}`);

        this._driveService.updateClassifiedChannelList(db);
    }

    private _reRegisterChannels(db: ClassifiedYoutubeChannelDatabase, channels: IYoutubeChannel[], topics: string[]) : void {
        db.reset();
        this._driveService.updateClassifiedChannelList(db);
        this._registerNewChannels(db, channels, topics);
    }

    private _mapChannelNamesToIds(db: IClassifiedYoutubeChannelDatabase, newChannels: IYoutubeChannel[]) : IClassifiedYoutubeChannelDatabase {
        const remappedResult: IClassifiedYoutubeChannelDatabase = {};

        for (const channelName in db) {
            const channel = newChannels.find(c => c.name === channelName);

            if (!channel) continue;

            const topics = db[channelName].topics ?? [];
            remappedResult[channel.id] = {
                channel: channelName,
                unClassified: topics.length == 0,
                topics: topics
            };
        }

        return remappedResult;
    }

    private _getSubscribedChannels(): IYoutubeChannel[] {
        let channels: IYoutubeChannel[] = [];
        let pageToken: string | null = null;

        do {
            const response: any = YouTube?.Subscriptions.list("snippet", {
                mine: true,
                maxResults: 50,
                pageToken: pageToken
            });

            const mapped = response.items.map((item: any) => ({
                id: item.snippet.resourceId.channelId,
                name: item.snippet.title
            })) as IYoutubeChannel[];

            channels = [...channels, ...mapped];

            pageToken = response.nextPageToken ?? null;
        } while (pageToken);

        return channels;
    }
}