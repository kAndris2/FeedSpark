import { IAiStudioSettings } from "../Interfaces/IAiStudioSettings";
import { AiStudioServiceBase } from "./AiStudioServiceBase";

export class YoutubeAiService extends AiStudioServiceBase {
    constructor(settings: IAiStudioSettings) {
        super(settings);
    }

    public classifyChannels(prompt: string, channelNames: string[]) : boolean[] {
        const extendedPrompt = prompt + `
            Channels:
            ${JSON.stringify(channelNames, null, 2)}
        `;

        return this._ask(extendedPrompt, channelNames.length);
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
        
        return this._ask(prompt, titles.length);
    }

    private _ask(prompt: string, itemCount: number) : boolean[] {
        const responseText = super.send(prompt);
        let result: boolean[];

        try {
            result = JSON.parse(responseText);
        } 
        catch (e) {
            throw new Error(`The response is not a valid JSON! - '${responseText}'`);
        }

        if (!Array.isArray(result) || !result.every(v => typeof v === 'boolean')) {
            throw new Error(`The response is not a boolean array! - '${responseText}'`);
        }

        if (result.length !== itemCount) {
            throw new Error(`The length of the response (${result.length}) does not match the number of items (${itemCount}).`);
        }

        return result;
    }
}