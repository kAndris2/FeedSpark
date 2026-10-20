import { CatalogItem } from "../Interfaces/ICatalogItem";
import { MailServiceBase } from "./MailServiceBase";

export class CatalogMailService extends MailServiceBase<Map<string, CatalogItem[]>> {
    public sendSummary(summary: Map<string, CatalogItem[]>): void {
        this.send(summary, "Catalog", "Catalog summary");
    }
}