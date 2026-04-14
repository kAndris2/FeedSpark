import { IYoutubeChannel } from "../Interfaces/IYoutubeChannel";

export class YoutubeChannelClassifier {
    public classifyChannels() : void {
        const subscribedChannels = this._getSubscribedChannels();
    }

    private _getSubscribedChannels(): IYoutubeChannel[] {
        let channels: IYoutubeChannel[] = [];
        let pageToken: string | null = null;

        do {
            const response: any = YouTube?.Subscriptions.list("snippet", {
                mine: true,
                maxResults: 50,
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