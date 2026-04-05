interface IYouTubeSubscriptionListResponse {
  items: IYouTubeSubscriptionItem[];
  nextPageToken?: string;
}

interface IYouTubeSubscriptionItem {
  snippet: {
    title: string;
    resourceId: {
      channelId: string;
    };
  };
}

declare namespace GoogleAppsScript {
  namespace YouTube {
    namespace Subscriptions {
      function list(
        part: string,
        params: {
          mine?: boolean;
          maxResults?: number;
          pageToken?: string | null;
        }
      ) : IYouTubeSubscriptionListResponse;
    }
  }
}