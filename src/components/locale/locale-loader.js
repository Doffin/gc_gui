const localeCatalogCache = new Map();
const localeCatalogRequests = new Map();

import supportedLanguagesCatalog from "./languages.json";

export { supportedLanguagesCatalog };

export function normalizeLanguageCode(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().slice(0, 2).toLowerCase();
}

export async function loadLanguageCatalog(code) {
    const normalizedCode = normalizeLanguageCode(code);
    if (!normalizedCode) {
        return null;
    }

    if (localeCatalogCache.has(normalizedCode)) {
        return localeCatalogCache.get(normalizedCode);
    }

    if (localeCatalogRequests.has(normalizedCode)) {
        return localeCatalogRequests.get(normalizedCode);
    }

    const request = (async () => {
        try {
            const url = new URL(`./${normalizedCode}_lang.json`, import.meta.url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Locale file not found: ${normalizedCode}`);
            }

            const catalog = await response.json();
            localeCatalogCache.set(normalizedCode, catalog);
            return catalog;
        } finally {
            localeCatalogRequests.delete(normalizedCode);
        }
    })();

    localeCatalogRequests.set(normalizedCode, request);
    return request;
}