export interface IYoutubeSettings {
    rssVersion: string;
    daysToCheck: number;
    topicSettings: IYoutubeTopicSettings;
}

export interface IYoutubeTopicSettings {
    topics: IYoutubeTopic[];
    prompt: string;
}

export interface IYoutubeTopic {
    name: string;
    aiFilter: boolean;
    prompt: string;
    skipIfContains: string[];
}