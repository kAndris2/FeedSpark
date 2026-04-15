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
        const extendedPrompt = prompt + `
            Channels:
            ${JSON.stringify(channels, null, 2)}
            Topics:
            ${JSON.stringify(topics, null, 2)}
        `;

        const responseText = super.send(extendedPrompt);
        const out: { value?: IClassifiedYoutubeChannelDatabase } = {};

        if (!ConverterService.tryParseJson<IClassifiedYoutubeChannelDatabase>(responseText, out)) {
            throw new Error(`The response is not a valid JSON! - '${responseText}'`);
        }

        const result = new ClassifiedYoutubeChannelDatabase(out.value as IClassifiedYoutubeChannelDatabase);

        if (result.count() !== channels.length) {
            throw new Error(`The length of the response (${result.count()}) does not match the number of items (${channels.length}).`);
        }

        return result;
    }

    public classifyMusicTitles(titles: string[]) : boolean[] {
        const prompt = `
            Classify YouTube titles.

            Output: JSON boolean array in same order.

            TRUE: music (song, track, single, remix, mashup, album, EP, mixtape, DJ set, mix, lofi, beat tape, official audio/video).

            FALSE: radio shows, radio episodes, live content (live, livestream, live session, concert, premiere) or non‑music (vlog, commentary, podcast, tutorial, tech, gaming, reaction, news, review, educational).

            Titles:
            ${JSON.stringify(titles, null, 2)}
        `;
        
        const responseText = super.send(prompt);
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