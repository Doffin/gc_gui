import "./components/app-root.js";
import { XCounter } from "./components/x-counter.js";
import "./components/x-card.js";
import "./components/gc-serialport.js";
import "./components/gc-du-link.js";
import "./components/gc-gps-link.js";
import "./components/gc-message-area.js";
import "./components/gc-table.js";
//import { GCTable } from "./components/gc-table.js";

async function loadLanguageCatalog(code) {
    const normalizedCode = String(code || "").trim().slice(0, 2).toLowerCase();
    if (!normalizedCode) {
        return null;
    }

    const localeUrl = new URL(`./components/locale/${normalizedCode}_lang.json`, import.meta.url);
    const response = await fetch(localeUrl);
    if (!response.ok) {
        throw new Error(`Failed to load locale '${normalizedCode}' (${response.status})`);
    }

    return response.json();
}

window.addEventListener("count-change", (event) => {
    console.log("Count changed:", event.detail.value);
    // XCounter.sayHello(event.detail.value+1);
    // This is just an example the counter value have no real purpose in this app, but you can use it to update the UI or trigger other actions as needed.
    document.getElementById("gcDULink").setAttribute("counter", "Count: " + event.detail.value);
});

document.addEventListener("DOMContentLoaded", () => {
    const langSelect = document.getElementById("gcLangSelect");
    if (langSelect) {
        const languages = [
            { code: "en", label: "English" },
            { code: "no", label: "Norsk" },
        ];
        languages.forEach((lang) => {
            const option = document.createElement("option");
            option.value = lang.code;
            option.textContent = lang.label;
            langSelect.appendChild(option);
        });
        langSelect.addEventListener("change", (event) => {
            setAppLanguage(event.target.value);
        });
    }

});


document.addEventListener("app-language-change", (event) => {
    const langSelect = document.getElementById("gcLangSelect");
    if (langSelect) {
        langSelect.value = event.detail.code;
    }
});


async function setAppLanguage(code) {
    const normalizedCode = String(code || "").trim().slice(0, 2).toLowerCase();
    if (!normalizedCode) {
        return;
    }

    document.documentElement.lang = normalizedCode;
    try {
        localStorage.setItem("gc.app.language", normalizedCode);
    } catch {
        // ignore storage errors
    }
    const langCatalog = await loadLanguageCatalog(normalizedCode);

    document.dispatchEvent(
        new CustomEvent("app-language-change", {
            detail: { code: normalizedCode, catalog: langCatalog },
        }),
    );
}

window.setAppLanguage = setAppLanguage;

let initialLanguage = "en";
try {
    initialLanguage = localStorage.getItem("gc.app.language") || document.documentElement.lang || "en";
} catch {
    initialLanguage = document.documentElement.lang || "en";
}

setAppLanguage(initialLanguage);



