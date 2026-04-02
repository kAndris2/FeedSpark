export abstract class MailServiceBase {
    protected send(htmlTemplate: GoogleAppsScript.HTML.HtmlTemplate) : void {
        const htmlOutput = htmlTemplate.evaluate().getContent();

        MailApp.sendEmail({
            to: Session.getActiveUser().getEmail(),
            subject: "Renderelt HTML sablon",
            htmlBody: htmlOutput
        });
    }

    protected getHtmlTemplate(templateName: string) : GoogleAppsScript.HTML.HtmlTemplate {
        return HtmlService.createTemplateFromFile(`Templates/${templateName}`);
    }
}