export class ConverterService {
    public static getConvertedProperty<T>(key: string, type: 'string' | 'number' | 'boolean'): T {
        const value = PropertiesService.getScriptProperties().getProperty(key);

        if (value === null) {
            throw new Error(`Missing property: ${key}`);
        }

        switch (type) {
            case 'number': return Number(value) as T;
            case 'boolean': return (value.toLowerCase() === 'true') as T;
            default: return value as T;
        }
    }

    public static decodeEscaped(text: string) : string {
        return text.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
        );
    }

    public static fixUrl(url: string): string {
        return url
            .replace(/\\\//g, "/")
            .replace(/\\\"/g, "\"")
            .replace(/\\+/g, "")
            .replace(/=\s+/g, "=")
            .replace(/\s+/g, "")
            .trim();
    }

    public static getFormattedDateStr(date: Date) : string {
        return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy.MM.dd");
    }
}