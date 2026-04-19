import { IAiStudioSettings } from "../Interfaces/IAiStudioSettings";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { HttpRequestManager } from "./HttpRequestManager";
import { PropertyService, PropertyType } from "./PropertyService";

export abstract class AiStudioServiceBase {
    private readonly _apiKey: string;
    private readonly _apiUrl: string;
    private readonly _aiModelPriority: string[];
    private _aiModelPriorityIndex: number = 0;

    constructor(settings: IAiStudioSettings) {
        this._apiKey = settings.key;
        this._apiUrl = PropertyService.getProperty(ScriptPropertiesKeyVault.aiStudioApiUrl, 'string', PropertyType.Script);
        this._aiModelPriority = settings.modelPriority;
    }

    protected send(prompt: string): any {
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

            const url = `${this._apiUrl}/models/${this._aiModelPriority[this._aiModelPriorityIndex]}:generateContent?key=${this._apiKey}`;
            const response = HttpRequestManager.fetch(url, {
                method: 'post',
                contentType: 'application/json',
                payload: JSON.stringify(payload),
                muteHttpExceptions: true
            });

            const status = response.getResponseCode();
            const body = response.getContentText();

            switch (status) {
                case 200: {
                    const data = JSON.parse(body);
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
                        ?? (() => { throw new Error('Unexpected structure of response!'); })();

                    return this._extractJson(text);
                }
                case 503: {
                    if (attempt < maxRetries) {
                        const delay = Math.pow(2, attempt - 1) * 1000;
                        Utilities.sleep(delay);
                        continue;
                    }
                    
                    throw new Error(`Model unavailable after ${maxRetries} attempts: ${body}`);
                }
                case 429: {
                    this._aiModelPriorityIndex++;
                    attempt = 0;
                    
                    if (this._aiModelPriorityIndex >= this._aiModelPriority.length) {
                        throw new Error('All models are exhausted!');
                    }

                    Utilities.sleep(2000);
                    continue;
                }
                default: {
                    throw new Error(`An unhandled error occured! - Status: ${status} | Body: ${body}`);
                }
            }
        }
    }

    private _extractJson(text: string) {
        const fenceMatch = text.match(/```json([\s\S]*?)```/i);
        return fenceMatch ? fenceMatch[1].trim() : text.trim();
    }
}