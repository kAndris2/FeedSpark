export interface IYoutubeSettings {
    rssVersion: string;
    daysToCheck: number;
    topicSettings: IYoutubeTopicSettings;
}

export interface IYoutubeTopicSettings {
    topics: IYoutubeTopic[];
}

export interface IYoutubeTopic {
    name: string;
    needShorts: boolean;
    aiFilter: boolean;
    prompt: string;
    skipIfContains: string[];
    ignoredChannelIds: string[];
}