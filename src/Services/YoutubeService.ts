import { ILogable, LogSeverity } from "../Interfaces/ILogable";
import { IYoutubeChannel } from "../Interfaces/IYoutubeChannel";
import { IYoutubeVideoStatistics } from "../Interfaces/IYoutubeSummary";
import { GeneralService } from "../Misc/GeneralService";
import { HelperConstants } from "../Misc/HelperConstants";
import { GenericLogger } from "./GenericLogger";

export class YoutubeService implements ILogable {
    log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }
    
    public getVideoStats(videoIds: string[]) : IYoutubeVideoStatistics[] {
        const chunks = GeneralService.chunkArray(videoIds, HelperConstants.youtubeVideoStatListBatchLimit);
        let videoStatistics: IYoutubeVideoStatistics[] = [];

        for (const videoIdchunk of chunks) {
            const response = YouTube?.Videos.list("statistics", { 
                id: videoIdchunk.join(",") 
            });

            if (!response?.items || response.items.length === 0) {
                this.log(LogSeverity.Warn, "No video statistics found!");
                continue;
            }

            if (response.items.length !== videoIdchunk.length) {
                this.log(LogSeverity.Warn, "The number of returned items does not match the number of input IDs!");
            }

            const videoStatChunk = response.items.map(videoStat => {
                return {
                    videoId: videoStat.id,
                    likeCount: parseInt(videoStat.statistics?.likeCount ?? "0"),
                    viewCount: parseInt(videoStat.statistics?.viewCount ?? "0"),
                    commentCount: parseInt(videoStat.statistics?.commentCount ?? "0")
                } as IYoutubeVideoStatistics
            });

            videoStatistics = [...videoStatistics, ...videoStatChunk];
        }

        return videoStatistics;
    }

    public getSubscribedChannels(): IYoutubeChannel[] {
        let channels: IYoutubeChannel[] = [];
        let pageToken: string | null = null;

        do {
            const response: any = YouTube?.Subscriptions.list("snippet", {
                mine: true,
                maxResults: HelperConstants.youtubeSubscriptionListBatchLimit,
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