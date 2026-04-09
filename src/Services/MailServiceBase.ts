export abstract class MailServiceBase<T> {
    public abstract sendSummary(summary: T) : void;

    protected send(htmlTemplate: GoogleAppsScript.HTML.HtmlTemplate, subject: string) : void {
        const htmlOutput = htmlTemplate.evaluate().getContent();

        MailApp.sendEmail({
            to: Session.getActiveUser().getEmail(),
            subject: subject,
            htmlBody: htmlOutput
        });
    }

    protected getHtmlTemplate(templateName: string) : GoogleAppsScript.HTML.HtmlTemplate {
        return HtmlService.createTemplateFromFile(`Templates/${templateName}`);
    }
}