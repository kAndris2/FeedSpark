import { IAiStudioSettings } from "../Interfaces/IAiStudioSettings";
import { ILogable, LogSeverity } from "../Interfaces/ILogable";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { ConverterService } from "./ConverterService";
import { GenericLogger } from "./GenericLogger";
import { HttpRequestManager } from "./HttpRequestManager";
import { PropertyService, PropertyType } from "./PropertyService";

export abstract class AiStudioServiceBase implements ILogable {
    private readonly _apiKey: string;
    private readonly _apiUrl: string;
    private readonly _aiModelPriority: string[];
    private _aiModelPriorityIndex: number = 0;

    constructor(settings: IAiStudioSettings) {
        this._apiKey = settings.key;
        this._apiUrl = PropertyService.getProperty(ScriptPropertiesKeyVault.aiStudioApiUrl, 'string', PropertyType.Script);
        this._aiModelPriority = settings.modelPriority;
    }

    log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }

    protected send<T>(prompt: string): T {
        const payload = {
            contents: [{
                parts: [{ 
                    text: prompt 
                }]
            }]
        };
        const maxRetries = 3;
        let attempt = 0;

        while (true) {
            attempt++;
            this.log(LogSeverity.Info, `Initiating AI request. Preparing prompt transmission. Attempt ${attempt}. Model: ${this._aiModelPriority[this._aiModelPriorityIndex]}.`);

            const url = `${this._apiUrl}/models/${this._aiModelPriority[this._aiModelPriorityIndex]}:generateContent?key=${this._apiKey}`;
            const response = HttpRequestManager.fetch(url, {
                method: 'post',
                contentType: 'application/json',
                payload: JSON.stringify(payload),
                muteHttpExceptions: true
            });

            const status = response.getResponseCode();
            const body = response.getContentText();

            try {
                switch (status) {
                    case 200: {
                        const data = JSON.parse(body);
                        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
                            ?? (() => { throw new Error('Unexpected structure of response!'); })();

                        this.log(LogSeverity.Info, "Prompt processing completed successfully!");

                        const extractedJson = this._extractJson(text);
                        const out: { value?: T } = {};

                        if (!ConverterService.tryParseJson<T>(extractedJson, out)) {
                            throw new Error(`The response is not a valid JSON! - '${extractedJson}'`);
                        }

                        return out.value as T;
                    }
                    case 503: {
                        if (attempt < maxRetries) {
                            const delay = Math.pow(2, attempt - 1) * 1000;
                            this.log(LogSeverity.Warn, `Service currently unavailable. Attempting recovery by retrying in ${delay} seconds.`);
                            Utilities.sleep(delay);
                            continue;
                        }
                        
                        throw new Error(`Model unavailable after ${maxRetries} attempts! - Body: ${body}`);
                    }
                    case 429: {
                        this._aiModelPriorityIndex++;
                        attempt = 0;
                        
                        if (this._aiModelPriorityIndex >= this._aiModelPriority.length) {
                            throw new Error('All configured models are exhausted!');
                        }

                        this.log(LogSeverity.Warn, `Rate limit exceeded. Current model cannot process further requests. Switching to next model: ${this._aiModelPriority[this._aiModelPriorityIndex]}`);

                        Utilities.sleep(2000);
                        continue;
                    }
                    default: {
                        throw new Error(`An unhandled error occured! - Status: ${status} | Body: ${body}`);
                    }
                }
            }
            catch (e: any) {
                this.log(LogSeverity.Error, `Failed to send prompt due to an unexpected error! - Ex.: ${e.message}`);
                throw e;
            }
        }
    }

    private _extractJson(text: string) {
        const fenceMatch = text.match(/```json([\s\S]*?)```/i);
        return fenceMatch ? fenceMatch[1].trim() : text.trim();
    }
}