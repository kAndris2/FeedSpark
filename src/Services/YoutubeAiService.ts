import { IGeminiSettings } from "../Interfaces/IGeminiSettings";
import { GeminiService } from "./GeminiService";

export class YoutubeAiService extends GeminiService {
    constructor(settings: IGeminiSettings) {
        super(settings);
    }

    public classifyMusicTitles(titles: string[]) : boolean[] {
        const prompt = `
            You are a classifier. Your task is to determine whether each YouTube video title in the list below represents music-related content.

            Mark a title as TRUE only if:
            - it is clearly music content (song, track, single, remix, mashup, album, EP, mixtape, DJ set, mix, lofi mix, beat tape, official audio, official music video).

            Mark a title as FALSE if:
            - it is a livestream, live broadcast, live recording, live session, live performance, concert recording, premiere, or anything indicating a live event.
            - it is not music-related (vlog, commentary, podcast, tutorial, tech video, gaming, reaction, news, review, educational content).

            Output format:
            Return ONLY a JSON array of booleans, where each element corresponds to the input title at the same index.
            Example: [true, false, true]

            Do not include explanations or any additional text.

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