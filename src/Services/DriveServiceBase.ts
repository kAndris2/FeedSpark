export abstract class DriveServiceBase {
    protected get<T>(fileName: string) : T | null {
        const file = this.getLatestConfigFile(fileName);

        return file ? JSON.parse(file.getBlob().getDataAsString()) as T : null;
    }

    protected getLatestConfigFile(fileName: string) : GoogleAppsScript.Drive.File | null {
        const files = DriveApp.getFilesByName(fileName);
        let latest: GoogleAppsScript.Drive.File | null = null;

        while (files.hasNext()) { 
            const file = files.next();

            if (!latest || file.getLastUpdated() > latest.getLastUpdated()) {
                latest = file;
            }
        }

        return latest;
    }
}