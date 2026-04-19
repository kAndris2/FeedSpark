import { IClassifiedYoutubeChannelDatabase, IClassifiedYoutubeChannelInfo } from "../Interfaces/IClassifiedYoutubeChannelDatabase";

export class ClassifiedYoutubeChannelDatabase implements IClassifiedYoutubeChannelDatabase {
    
    [channelId: string]: IClassifiedYoutubeChannelInfo | any;

    constructor(db: IClassifiedYoutubeChannelDatabase | null) {
        if (!db) return;

        Object.assign(this, db);
    }

    public getChannelIdsByTopic(topic: string) : string[] {
        const relevantIds: string[] = [];

        for (const channelId of this.getChannelIds()) {
            const info = this[channelId] as IClassifiedYoutubeChannelInfo;

            if (!info.topics.some(t => t === topic)) continue;

            relevantIds.push(channelId);
        }

        return relevantIds;
    }

    public addRange(db: IClassifiedYoutubeChannelDatabase): void {
        for (const channelId in db) {
            if (!Object.prototype.hasOwnProperty.call(db, channelId)) continue;

            const info = db[channelId];
            this[channelId] = info;
        }
    }

    public has(channelId: string) : boolean {
        return this[channelId] !== undefined;
    }

    public count() : number {
        return Object.keys(this).length;
    }

    public reset(): void {
        for (const channelId of this.getChannelIds()) {
            this._removeChannel(channelId);
        }
    }

    public getChannelIds(): string[] {
        return Object.keys(this);
    }

    public getTopics(): string[] {
        const topics = new Set<string>();

        for (const channelId of this.getChannelIds()) {
            const info = this[channelId] as IClassifiedYoutubeChannelInfo;

            if (!info?.topics) continue;

            for (const topic of info.topics) {
                topics.add(topic);
            }
        }

        return Array.from(topics);
    }

    public normalize(subscribedChannelIds: string[], requiredTopics: string[]) : void {
        this._removeUnsubscribedChannels(subscribedChannelIds);
        this._removeUnusedTopicsFromChannels(requiredTopics);
    }

    private _removeUnsubscribedChannels(subscribedChannelIds: string[]) : void {
        this.getChannelIds()
            .filter(classifiedChannelId => !subscribedChannelIds.some(subscribedChannelId => subscribedChannelId === classifiedChannelId))
            .forEach(channelId => this._removeChannel(channelId));
    }

    private _removeUnusedTopicsFromChannels(requiredTopics: string[]) : void {
        const registeredTopics = this.getTopics();
        const unusedTopics = registeredTopics.filter(function(registeredTopic) {
            return requiredTopics.indexOf(registeredTopic) === -1;
        });

        if (unusedTopics.length == 0) return;

        for (const channelId of this.getChannelIds()) {
            const info = this[channelId] as IClassifiedYoutubeChannelInfo;

            if (info.unClassified && info.topics.length == 0) continue;

            for (const unusedTopic of unusedTopics) {
                const matchIndex = info.topics.indexOf(unusedTopic);

                if (matchIndex === -1) continue;

                info.topics.splice(matchIndex, 1);
            }

            if (info.topics.length === 0) {
                this._removeChannel(channelId);
            }
        }
    }

    private _removeChannel(channelId: string) : void {
        delete this[channelId];
    }
}