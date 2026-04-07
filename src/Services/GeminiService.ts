import { IGeminiSettings } from "../Interfaces/IGeminiSettings";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { ConverterService } from "./ConverterService";
import { HttpRequestManager } from "./HttpRequestManager";

export abstract class GeminiService {
    private readonly _apiKey: string;
    private readonly _apiUrl: string;
    private readonly _aiModel: string;

    constructor(settings: IGeminiSettings) {
        this._apiKey = settings.key;
        this._apiUrl = ConverterService.getConvertedProperty(ScriptPropertiesKeyVault.geminiApiUrl, 'string');
        this._aiModel = ConverterService.getConvertedProperty(ScriptPropertiesKeyVault.geminiModel, 'string');
    }

    protected send(prompt: string) : any {
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

        return text;
    }
}