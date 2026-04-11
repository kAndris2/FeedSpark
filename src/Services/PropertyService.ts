import { UserPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { ConverterService } from "./ConverterService";

export enum PropertyType {
    Script,
    User
};

export class PropertyService {
    public static getUserId() : string {
        let userId = this.getProperty<string>(UserPropertiesKeyVault.userId, 'string', PropertyType.User);
        
        if (!userId) {
            const uniqueId = Utilities.getUuid();
            this.setProperty(UserPropertiesKeyVault.userId, uniqueId, PropertyType.User);
            userId = uniqueId;
        }

        return userId;
    }

    public static getProperty<T>(key: string, type: 'string' | 'number' | 'boolean', propType: PropertyType) : T {
        const value = this._getPropertiesByType(propType).getProperty(key);

        if (value === null) {
            throw new Error(`Missing property: ${key}`);
        }

        return ConverterService.convertTo(value, type);
    }

    public static setProperty(key: string, value: string, propType: PropertyType) : void {
        const props = this._getPropertiesByType(propType);
        props.setProperty(key, value);
    }

    private static _getPropertiesByType(type: PropertyType) : GoogleAppsScript.Properties.Properties {
        switch (type) {
            case PropertyType.Script: return PropertiesService.getScriptProperties();
            case PropertyType.User: return PropertiesService.getUserProperties();
        }
    }
}