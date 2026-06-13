export class DateHelper {
    public static getFormattedDateStr(date: Date, format: string) : string {
        return Utilities.formatDate(date, Session.getScriptTimeZone(), format);
    }
}