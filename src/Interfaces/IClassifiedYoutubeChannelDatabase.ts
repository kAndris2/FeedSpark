export interface IClassifiedYoutubeChannelDatabase {
    [channelId: string]: IClassifiedYoutubeChannelInfo;
}

export interface IClassifiedYoutubeChannelInfo {
    topics: string[];
}