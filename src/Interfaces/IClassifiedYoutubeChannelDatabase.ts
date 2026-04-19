export interface IClassifiedYoutubeChannelDatabase {
    [channelId: string]: IClassifiedYoutubeChannelInfo;
}

export interface IClassifiedYoutubeChannelInfo {
    name: string;
    unClassified: boolean;
    topics: string[];
}