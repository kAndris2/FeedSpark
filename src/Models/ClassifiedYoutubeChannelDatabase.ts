import { IClassifiedYoutubeChannelDatabase, IClassifiedYoutubeChannelInfo } from "../Interfaces/IClassifiedYoutubeChannelDatabase";

export class ClassifiedYoutubeChannelDatabase implements IClassifiedYoutubeChannelDatabase {
    
    [channelId: string]: IClassifiedYoutubeChannelInfo | any;

    constructor(db: IClassifiedYoutubeChannelDatabase | null) {
        if (!db) return;

        Object.assign(this, db);
    }

    public addChannel(channelId: string, info: IClassifiedYoutubeChannelInfo) : void {
        this[channelId] = {
            topics: info.topics.slice()
        };
    }

    public addRange(db: IClassifiedYoutubeChannelDatabase): void {
        for (const channelId in db) {
            if (!Object.prototype.hasOwnProperty.call(db, channelId)) continue;

            const info = db[channelId];
            if (!info) continue;

            this.addChannel(channelId, info);
        }
    }

    public updateChannel(channelId: string, info: IClassifiedYoutubeChannelInfo) : void {
        this[channelId].topics = info.topics.slice();
    }

    public removeChannel(channelId: string) : void {
        delete this[channelId];
    }

    public has(channelId: string) : boolean {
        return this[channelId] !== undefined;
    }

    public get(channelId: string) : IClassifiedYoutubeChannelInfo {
        return this[channelId];
    }

    public count() : number {
        return Object.keys(this).length;
    }

    public getChannelIds(): string[] {
        const ids: string[] = [];

        for (const channelId in this) {
            if (Object.prototype.hasOwnProperty.call(this, channelId)) {
                ids.push(channelId);
            }
        }

        return ids;
    }

    public getTopics() : string[] {
        const unique: { [topic: string]: boolean } = {};

        for (const channelId in this) {
            if (Object.prototype.hasOwnProperty.call(this, channelId)) {
                const info = this[channelId];

                if (info && info.topics && info.topics.length > 0) {
                    for (let i = 0; i < info.topics.length; i++) {
                        const topic = info.topics[i];
                        unique[topic] = true;
                    }
                }
            }
        }

        return Object.keys(unique);
    }

    public normalize(subscribedChannelIds: string[], requiredTopics: string[]) : void {
        this._removeUnsubscribedChannels(subscribedChannelIds);
        this._removeUnusedTopicsFromChannels(requiredTopics);
    }

    private _removeUnsubscribedChannels(subscribedChannelIds: string[]) : void {
        this.getChannelIds()
            .filter(classifiedChannelId => !subscribedChannelIds.some(subscribedChannelId => subscribedChannelId === classifiedChannelId))
            .forEach(channelId => this.removeChannel(channelId));
    }

    private _removeUnusedTopicsFromChannels(requiredTopics: string[]) : void {
        const registeredTopics = this.getTopics();
        const unusedTopics = registeredTopics.filter(function(registeredTopic) {
            return requiredTopics.indexOf(registeredTopic) === -1;
        });

        if (unusedTopics.length == 0) return;

        for (const channelId in this) {
           if (!Object.prototype.hasOwnProperty.call(this, channelId)) continue;

           const info = this[channelId] as IClassifiedYoutubeChannelInfo;

            for (const unusedTopic of unusedTopics) {
                const matchIndex = info.topics.indexOf(unusedTopic);

                if (matchIndex === -1) continue;

                info.topics.splice(matchIndex, 1);
            }

            if (info.topics.length === 0) {
                this.removeChannel(channelId);
            }
        }
    }
}