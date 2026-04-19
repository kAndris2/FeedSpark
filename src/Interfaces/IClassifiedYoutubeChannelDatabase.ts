export interface IClassifiedYoutubeChannelDatabase {
    [channelId: string]: IClassifiedYoutubeChannelInfo;
}

export interface IClassifiedYoutubeChannelInfo {
    channel: string;
    unClassified: boolean;
    topics: string[];
}