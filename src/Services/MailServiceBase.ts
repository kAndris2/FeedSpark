import { ILogable, LogSeverity } from "../Interfaces/ILogable";
import { GenericLogger } from "./GenericLogger";

export abstract class MailServiceBase<T> implements ILogable {
    log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }

    public abstract sendSummary(summary: T) : void;

    protected send(summary: T, templateName: string, subject: string) : void {
        const htmlTemplate = this._getHtmlTemplate(templateName, summary);
        const htmlOutput = htmlTemplate.evaluate().getContent();

        MailApp.sendEmail({
            to: Session.getActiveUser().getEmail(),
            subject: subject,
            htmlBody: htmlOutput
        });

        this.log(LogSeverity.Info, `Summary email sent. - Subject: ${subject}`);
    }

    private _getHtmlTemplate(templateName: string, summary: T) : GoogleAppsScript.HTML.HtmlTemplate {
        const template = HtmlService.createTemplateFromFile(`Templates/${templateName}`);
        template.summary = summary;

        return template;
    }
}