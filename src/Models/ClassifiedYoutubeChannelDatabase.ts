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
}