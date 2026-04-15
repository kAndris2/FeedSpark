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
        this._removeUnsubscribedChannels(classifiedChannelDatabase, subscribedChannels.map(c => c.id));
        
        const relevantYoutubeChannels = subscribedChannels.filter(subscribedChannel => !classifiedChannelDatabase.has(subscribedChannel.id));

        const requiredTopics = this._settings.topics.map(t => t.name);
        const registeredTopics = classifiedChannelDatabase.getTopics();
        const allRegistered = requiredTopics.every(function(requiredTopic) {
            return registeredTopics.indexOf(requiredTopic) !== -1;
        });

        if (!allRegistered) {
            /* const missingTopics = requiredTopics.filter(function(requiredTopic) {
                return registeredTopics.indexOf(requiredTopic) === -1;
            }); */
        }
    }

    private _removeUnsubscribedChannels(db: ClassifiedYoutubeChannelDatabase, subscribedChannelIds: string[]) : void {
        db.getChannelIds()
            .filter(classifiedChannelId => !subscribedChannelIds.some(subscribedChannelId => subscribedChannelId === classifiedChannelId))
            .forEach(channelId => db.removeChannel(channelId));
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