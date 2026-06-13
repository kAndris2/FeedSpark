import { ILoggerSettings } from "../Interfaces/ILoggerSettings";
import { ISelfConstructible } from "../Interfaces/ISelfConstructible";

export class LoggerSettings implements ILoggerSettings, ISelfConstructible<ILoggerSettings> {
    logExpiryInDays!: number;
    driveLogging!: boolean;

    constructor(settings?: ILoggerSettings) {
        if (!settings) return;

        Object.assign(this, settings);
    }

    createDefault(): ILoggerSettings {
        return {
            logExpiryInDays: 14,
            driveLogging: true
        };
    }
}