import { IYoutubeChannelData, IYoutubeSummary } from "../Interfaces/IYoutubeSummary";

export class YoutubeSummary implements IYoutubeSummary {
    channels!: IYoutubeChannelData[];
    periodStartStr!: string;
    periodEndStr!: string;
    topic!: string;
    
    constructor(summary: IYoutubeSummary) {
        Object.assign(this, summary);
    }

    public countChannels() : number {
        return this.channels.length;
    }

    public countVideos() : number {
        return this.channels.reduce((sum, channel) => sum + channel.videos.length, 0);
    }
}