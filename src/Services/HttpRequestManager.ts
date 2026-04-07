export class HttpRequestManager {
    public static fetchParallel(urls: string[], params?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions) : GoogleAppsScript.URL_Fetch.HTTPResponse[] {
        const requests = urls.map(url => ({
            ...params,
            url: url
        }));

        return UrlFetchApp.fetchAll(requests);
    }
}