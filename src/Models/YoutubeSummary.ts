import { ILogable, LogSeverity } from "../Interfaces/ILogable";
import { IYoutubeChannelData, IYoutubeSummary } from "../Interfaces/IYoutubeSummary";
import { GenericLogger } from "../Services/GenericLogger";

export class YoutubeSummary implements IYoutubeSummary, ILogable {
    channels!: IYoutubeChannelData[];
    periodStartStr!: string;
    periodEndStr!: string;
    topic!: string;
    
    constructor(summary: IYoutubeSummary) {
        Object.assign(this, summary);
    }

    log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }

    public logRandomChannelImageDataUrl() : void {
        const randomChannelIndex = Math.floor(Math.random() * this.channels.length);
        const randomChannel = this.channels[randomChannelIndex];

        const randomVideoIndex = Math.floor(Math.random() * randomChannel.videos.length);
        const randomVideo = randomChannel.videos[randomVideoIndex];

        this.log(LogSeverity.Debug, `Avatar url: ${randomChannel.avatarUrl} | Banner url: ${randomChannel.bannerUrl} | Thumbnail url: ${randomVideo.thumbnailUrl}`);
    }

    public countChannels() : number {
        return this.channels.length;
    }

    public countVideos() : number {
        return this.channels.reduce((sum, channel) => sum + channel.videos.length, 0);
    }
}