import { LogSeverity } from "./ILogable";

export interface ILogEntry {
    date: Date;
    severity: LogSeverity;
    source: string;
    message: string;

    toString() : string;
}