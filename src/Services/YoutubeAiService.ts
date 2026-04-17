import { IAiStudioSettings } from "../Interfaces/IAiStudioSettings";
import { IClassifiedYoutubeChannelDatabase } from "../Interfaces/IClassifiedYoutubeChannelDatabase";
import { ClassifiedYoutubeChannelDatabase } from "../Models/ClassifiedYoutubeChannelDatabase";
import { AiStudioServiceBase } from "./AiStudioServiceBase";
import { ConverterService } from "./ConverterService";

export class YoutubeAiService extends AiStudioServiceBase {
    constructor(settings: IAiStudioSettings) {
        super(settings);
    }

    public classifyChannels(prompt: string, channels: string[], topics: string[]) : IClassifiedYoutubeChannelDatabase {
        const batchSize = 30;
        const dbs: IClassifiedYoutubeChannelDatabase[] = []; 

        for (let i = 0; i < channels.length; i += batchSize) {
            const channelBatch = channels.slice(i, i + batchSize);

            try {
                const extendedPrompt = prompt + `
                    Channels:
                    ${JSON.stringify(channelBatch, null, 2)}
                    Topics:
                    ${JSON.stringify(topics, null, 2)}
                `;

                const responseText = super.send(extendedPrompt);
                const out: { value?: IClassifiedYoutubeChannelDatabase } = {};

                if (!ConverterService.tryParseJson<IClassifiedYoutubeChannelDatabase>(responseText, out)) {
                    throw new Error(`The response is not a valid JSON! - '${responseText}'`);
                }

                const result = new ClassifiedYoutubeChannelDatabase(out.value as IClassifiedYoutubeChannelDatabase);
                const count = result.count();

                if (count !== channelBatch.length) {
                    throw new Error(`The length of the response (${count}) does not match the number of items (${channelBatch.length}).`);
                }

                dbs.push(result);
            }
            catch (_) {
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
        
        const responseText = super.send(extendedPrompt);
        const out: { value?: boolean[] } = {};

        if (!ConverterService.tryParseJson<boolean[]>(responseText, out)) {
            throw new Error(`The response is not a valid JSON! - '${responseText}'`);
        }

        const result = out.value as boolean[];

        if (!Array.isArray(result) || !result.every(v => typeof v === 'boolean')) {
            throw new Error(`The response is not a boolean array! - '${responseText}'`);
        }

        if (result.length !== titles.length) {
            throw new Error(`The length of the response (${result.length}) does not match the number of items (${titles.length}).`);
        }

        return result;
    }
}