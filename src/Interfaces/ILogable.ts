export interface ILogable {
    log(severity: LogSeverity, message: string) : void;
}

export enum LogSeverity {
    Info = "info",
    Warn = "warn",
    Error = "error",
    Debug = "debug"
}