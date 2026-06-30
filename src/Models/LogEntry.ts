import { LogSeverity } from "../Interfaces/ILogable";
import { ILogEntry } from "../Interfaces/ILogEntry";
import { DateHelper } from "../Misc/DateHelper";

export class LogEntry implements ILogEntry {
    date!: Date;
    severity!: LogSeverity;
    source!: string;
    message!: string;
    
    constructor(logEntry: ILogEntry) {
        Object.assign(this, logEntry);
    }

    public toString() : string {
        const parts: string[] = [
            DateHelper.getFormattedDateStr(this.date, "yyyy.MM.dd HH:mm:ss.SSS"),
            this.severity.toUpperCase(),
            this.source,
            this.message
        ];

        return parts.join('|');
    }
}