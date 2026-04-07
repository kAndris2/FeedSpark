import { IGeminiSettings } from "../Interfaces/IGeminiSettings";
import { GeminiService } from "./GeminiService";

export class YoutubeAiService extends GeminiService {
    constructor(settings: IGeminiSettings) {
        super(settings);
    }

    public classifyMusicTitles(titles: string[]) : boolean[] {
        const prompt = `
            Classify YouTube titles.

            Output: JSON boolean array in same order.

            TRUE: music (song, track, single, remix, mashup, album, EP, mixtape, DJ set, mix, lofi, beat tape, official audio/video).

            FALSE: live content (live, livestream, live session, live recording, concert, premiere) or non‑music (vlog, commentary, podcast, tutorial, tech, gaming, reaction, news, review, educational).

            Titles:
            ${JSON.stringify(titles, null, 2)}
        `;
        
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

        if (result.length !== titles.length) {
            throw new Error(`The length of the response (${result.length}) does not match the number of titles (${titles.length}).`);
        }

        return result;
    }
}