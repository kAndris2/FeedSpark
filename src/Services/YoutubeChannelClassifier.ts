import { IClassifiedYoutubeChannelDatabase } from "../Interfaces/IClassifiedYoutubeChannelDatabase";
import { IYoutubeChannel } from "../Interfaces/IYoutubeChannel";
import { IYoutubeTopicSettings } from "../Interfaces/IYoutubeSettings";
import { ClassifiedYoutubeChannelDatabase } from "../Models/ClassifiedYoutubeChannelDatabase";
import { YoutubeAiService } from "./YoutubeAiService";
import { YoutubeDriveService } from "./YoutubeDriveService";

export class YoutubeChannelClassifier {
    private readonly _settings: IYoutubeTopicSettings;
    private readonly _aiService:  YoutubeAiService;
    private readonly _driveService: YoutubeDriveService;

    constructor(settings: IYoutubeTopicSettings, aiService: YoutubeAiService) {
        this._settings = settings;
        this._aiService = aiService;
        this._driveService = new YoutubeDriveService();
    }

    public classifyChannels() : void {
        const subscribedChannels = this._getSubscribedChannels();
        const classifiedChannelDatabase = this._driveService.getClassifiedChannelDataBase();
        const requiredTopics = this._settings.topics.map(t => t.name);
        classifiedChannelDatabase.normalize(subscribedChannels.map(c => c.id), requiredTopics);
        
        const registeredTopics = classifiedChannelDatabase.getTopics();

        if (registeredTopics.length >= 1) {
            const allTopicsRegistered = requiredTopics.every(function(requiredTopic) {
                return registeredTopics.indexOf(requiredTopic) !== -1;
            });

            if (!allTopicsRegistered) {
                this._reRegisterChannels(classifiedChannelDatabase, subscribedChannels, requiredTopics);
                return;
            }
        }

        const relevantYoutubeChannels = subscribedChannels.filter(subscribedChannel => !classifiedChannelDatabase.has(subscribedChannel.id));

        if (relevantYoutubeChannels.length == 0) return;

        this._registerNewChannels(classifiedChannelDatabase, relevantYoutubeChannels, requiredTopics);
    }

    private _registerNewChannels(db: ClassifiedYoutubeChannelDatabase, newChannels: IYoutubeChannel[], topics: string[]) : void {
        const result = this._aiService.classifyChannels(this._settings.prompt, newChannels.map(c => c.name), topics);
        const mappedResult = this._mapChannelNamesToIds(result, newChannels);
        db.addRange(mappedResult);
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