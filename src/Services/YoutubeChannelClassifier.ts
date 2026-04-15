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
        
        const allTopicsRegistered = requiredTopics.every(function(requiredTopic) {
            return registeredTopics.indexOf(requiredTopic) !== -1;
        });
        const relevantYoutubeChannels = subscribedChannels.filter(subscribedChannel => !classifiedChannelDatabase.has(subscribedChannel.id));

        if (!allTopicsRegistered) {
            this._reRegisterChannels();
            return;
        }

        this._registerNewChannels(relevantYoutubeChannels, requiredTopics);
    }

    private _registerNewChannels(newChannels: IYoutubeChannel[], topics: string[]) : void {

    }

    private _reRegisterChannels() : void {

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