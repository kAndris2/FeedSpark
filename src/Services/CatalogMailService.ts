import { ICatalogSummary } from "../Interfaces/ICatalogSummary";
import { MailServiceBase } from "./MailServiceBase";

export class CatalogMailService extends MailServiceBase<ICatalogSummary> {
    public sendSummary(summary: ICatalogSummary): void {
        this.send(summary, "Catalog", "Catalog summary");
    }
}