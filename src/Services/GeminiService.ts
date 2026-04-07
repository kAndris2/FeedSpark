import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { ConverterService } from "./ConverterService";
import { HttpRequestManager } from "./HttpRequestManager";

export class GeminiService {
    private readonly _apiKey: string;
    private readonly _apiUrl: string;
    private readonly _aiModel: string;

    constructor(apiKey: string) {
        this._apiKey = apiKey;
        this._apiUrl = ConverterService.getConvertedProperty(ScriptPropertiesKeyVault.geminiApiUrl, 'string');
        this._aiModel = ConverterService.getConvertedProperty(ScriptPropertiesKeyVault.geminiModel, 'string');
    }

    public classify(prompt: string) : boolean[] {
        const url = `${this._apiUrl}/models/${this._aiModel}:generateContent?key=${this._apiKey}`;
        const payload = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
        };
        const response = HttpRequestManager.fetch(url, {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
        });
        const data = JSON.parse(response.getContentText());
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? (() => { throw new Error('Unexpected structure of response!'); })();

        let result: boolean[];

        try {
            result = JSON.parse(text);
        } 
        catch (e) {
            throw new Error(`The response is not a valid JSON! - '${text}'`);
        }

        if (!Array.isArray(result) || !result.every(v => typeof v === 'boolean')) {
            throw new Error(`The response is not a boolean array! - '${text}'`);
        }

        return result;
    }
}