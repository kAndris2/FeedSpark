import { UserPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { ConverterService } from "./ConverterService";

export enum PropertyType {
    Script,
    User
};

export class PropertyService {
    public static getUserId() : string {
        try {
            return this.getProperty<string>(UserPropertiesKeyVault.userId, 'string', PropertyType.User);
        }
        catch (_) {
            const userId = this._createUserIdHash();
            this.setProperty(UserPropertiesKeyVault.userId, userId, PropertyType.User);
            return userId;
        }
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

    private static _createUserIdHash() : string {
        const email = Session.getActiveUser().getEmail();
        const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email);

        return digest
            .map(b => (b + 256).toString(16).slice(-2))
            .join('');
    }
}