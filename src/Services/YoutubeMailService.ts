import { YoutubeSummary } from "../Models/YoutubeSummary";
import { MailServiceBase } from "./MailServiceBase";

export class YoutubeMailService extends MailServiceBase<YoutubeSummary> {
    public sendSummary(summary: YoutubeSummary) : void {
        const template = this.getHtmlTemplate("Youtube");
        template.summary = summary;

        this.send(template, `YouTube summary (${summary.topic})`);
    }
}