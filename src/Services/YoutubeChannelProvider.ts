export class YoutubeChannelProvider {
    public getChannelIds(): string[] {
        let channelIds: string[] = [];
        let pageToken: string | null = null;

        do {
            const response = GoogleAppsScript.YouTube.Subscriptions.list("snippet", {
                mine: true,
                maxResults: 50,
                pageToken: pageToken
            });

            channelIds = [
                ...channelIds,
                ...response.items.map(item => item.snippet.resourceId.channelId)
            ];

            pageToken = response.nextPageToken ?? null;
        } while (pageToken);

        return channelIds;
    }
}