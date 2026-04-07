import { IGeminiSettings } from "../Interfaces/IGeminiSettings";
import { ISelfConstructible } from "../Interfaces/ISelfConstructible";

export class GeminiSettings implements IGeminiSettings, ISelfConstructible<IGeminiSettings> {
    key!: string;
    model!: string;

    constructor(settings?: IGeminiSettings) {
        if (!settings) return;

        Object.assign(this, settings);
    }

    createDefault(): IGeminiSettings {
        return {
            key: "",
            model: ""
        }
    }

}