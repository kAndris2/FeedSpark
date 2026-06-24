import { LogSeverity } from "../Interfaces/ILogable";
import { ILogEntry } from "../Interfaces/ILogEntry";
import { LogEntry } from "../Models/LogEntry";

export class GenericLogger {
    public static readonly logs: ILogEntry[] = [];
    
    public static addLog(source: string, message: string, severity: LogSeverity) : void {
        this._cloudLog(message, severity);

       this.logs.push(new LogEntry({
            date: new Date(),
            severity: severity,
            source: source,
            message: message
        }));
    }

    private static _cloudLog(message: string, severity: LogSeverity) : void {
        switch (severity) {
            case 'info': {
                console.info(message);
                break;
            }
            case 'warn': {
                console.warn(message);
                break;
            }
            case 'error': {
                console.error(message);
                break;
            }
            case 'debug': {
                console.debug(message);
                break;
            }
            default: {
                console.log(message);
                break;
            }
        }
    }
}