import { IYoutubeSummary } from "../Interfaces/IYoutubeSummary";
import { MailServiceBase } from "./MailServiceBase";

export class YoutubeMailService extends MailServiceBase {
    public sendSummary(summary: IYoutubeSummary) : void {
        const template = this.getHtmlTemplate("Youtube");
        template.summary = summary;

        this.send(template);
    }
}