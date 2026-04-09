import { IAiStudioSettings } from "../Interfaces/IAiStudioSettings";
import { ISelfConstructible } from "../Interfaces/ISelfConstructible";

export class AiStudioSettings implements IAiStudioSettings, ISelfConstructible<IAiStudioSettings> {
    key!: string;
    modelPriority!: string[];

    constructor(settings?: IAiStudioSettings) {
        if (!settings) return;

        Object.assign(this, settings);
    }

    createDefault(): IAiStudioSettings {
        return {
            key: "",
            modelPriority: []
        }
    }

}