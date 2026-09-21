const DATABASE_NAME = "gc-gui";
const DATABASE_VERSION = 1;
const STORE_NAME = "surveys";
const PRIMARY_KEY = "primary";

export class SurveyRepository {
    async getSurvey() {
        const database = await this.openDatabase();
        return this.runRequest(database, "readonly", (store) => store.get(PRIMARY_KEY));
    }

    async saveSurvey(surveyModel, activeJobIndex) {
        const database = await this.openDatabase();
        const record = {
            id: PRIMARY_KEY,
            surveyModel: structuredClone(surveyModel),
            activeJobIndex,
            savedAt: new Date().toISOString(),
        };
        await this.runRequest(database, "readwrite", (store) => store.put(record));
    }

    async clearSurvey() {
        const database = await this.openDatabase();
        await this.runRequest(database, "readwrite", (store) => store.delete(PRIMARY_KEY));
    }

    openDatabase() {
        if (!globalThis.indexedDB) {
            return Promise.reject(new Error("IndexedDB is not available"));
        }

        return new Promise((resolve, reject) => {
            const request = globalThis.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
            request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains(STORE_NAME)) {
                    request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error("Unable to open IndexedDB"));
        });
    }

    runRequest(database, mode, operation) {
        return new Promise((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, mode);
            const request = operation(transaction.objectStore(STORE_NAME));
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
            transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
        });
    }
}