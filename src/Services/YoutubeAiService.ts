import { IAiStudioSettings } from "../Interfaces/IAiStudioSettings";
import { IClassifiedYoutubeChannelDatabase } from "../Interfaces/IClassifiedYoutubeChannelDatabase";
import { LogSeverity } from "../Interfaces/ILogable";
import { ScriptPropertiesKeyVault } from "../Misc/ScriptPropertiesKeyVault";
import { ClassifiedYoutubeChannelDatabase } from "../Models/ClassifiedYoutubeChannelDatabase";
import { AiStudioServiceBase } from "./AiStudioServiceBase";
import { GenericLogger } from "./GenericLogger";
import { PropertyService, PropertyType } from "./PropertyService";

export class YoutubeAiService extends AiStudioServiceBase {
    private readonly _channelClassifierPrompt: string;

    constructor(settings: IAiStudioSettings) {
        super(settings);

        this._channelClassifierPrompt = PropertyService.getProperty(ScriptPropertiesKeyVault.youtubeChannelClassifierPrompt, 'string', PropertyType.Script);
    }

    override log(severity: LogSeverity, message: string): void {
        GenericLogger.addLog(this.constructor.name, message, severity);
    }

    public classifyChannels(channels: string[], topics: string[]) : IClassifiedYoutubeChannelDatabase {
        const batchSize = 30;
        const dbs: IClassifiedYoutubeChannelDatabase[] = []; 

        for (let i = 0; i < channels.length; i += batchSize) {
            const channelBatch = channels.slice(i, i + batchSize);

            try {
                const extendedPrompt = this._channelClassifierPrompt + `
                    Channels:
                    ${JSON.stringify(channelBatch, null, 2)}
                    Topics:
                    ${JSON.stringify(topics, null, 2)}
                `;

                const response = super.send<IClassifiedYoutubeChannelDatabase>(extendedPrompt);
                const result = new ClassifiedYoutubeChannelDatabase(response);
                const count = result.count();

                if (count !== channelBatch.length) {
                    throw new Error(`The length of the response (${count}) does not match the number of items (${channelBatch.length}).`);
                }

                dbs.push(result);
            }
            catch (e: any) {
                this.log(LogSeverity.Error, `Channel classification failed for the current ${batchSize} channels. These channels will be skipped. - Ex.: ${e.message}`);
                continue;
            }
        }

        const mergedDb = new ClassifiedYoutubeChannelDatabase(null);
        dbs.forEach(db => mergedDb.addRange(db));

        return mergedDb;
    }

    public classifyMusicTitles(prompt: string, titles: string[]) : boolean[] {
        const extendedPrompt = prompt + `
            Titles:
            ${JSON.stringify(titles, null, 2)}
        `;
        
        const response = super.send<boolean[]>(extendedPrompt);

        if (!Array.isArray(response) || !response.every(v => typeof v === 'boolean')) {
            throw new Error(`The response is not a boolean array! - '${JSON.stringify(response)}'`);
        }

        if (response.length !== titles.length) {
            throw new Error(`The length of the response (${response.length}) does not match the number of items (${titles.length}).`);
        }

        return response;
    }
}