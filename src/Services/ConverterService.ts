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
}