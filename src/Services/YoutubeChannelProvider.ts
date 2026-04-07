export class YoutubeChannelProvider {
    public getChannelIds(channelIdsToIgnore: string[]): string[] {
        let channelIds: string[] = [];
        let pageToken: string | null = null;

        do {
            const response: any = YouTube?.Subscriptions.list("snippet", {
                mine: true,
                maxResults: 50,
                pageToken: pageToken
            });

            channelIds = [
                ...channelIds,
                ...response.items.map((item: any) => item.snippet.resourceId.channelId)
            ];

            pageToken = response.nextPageToken ?? null;
        } while (pageToken);

        const ignoreSet = new Set(channelIdsToIgnore);
        const filteredIds = channelIds.filter(function(id) {
            return !ignoreSet.has(id);
        });

        return filteredIds;
    }
}