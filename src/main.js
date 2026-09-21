import "./components/gc-message-area.js";
import "./components/gc-table.js";
import "./components/gc-realtime.js";
import "./components/gc-select.js";
import "./components/gc-language-select.js";
import "./components/gc-measurements-table.js";
import "./components/gc-settings-page.js";
import "./components/gc-job-planner.js";

import "./components/gc-dataunit.js";
import "./components/gc-pump-control.js";
import "./components/gc-procedure-bar.js";
import "./components/gc-graph.js";
import { MainController } from "./controllers/main-controller.js";
import { GcUsbLink } from "./components/gc-usblink.js";
import { GcBleLink } from "./components/gc-blelink.js";
import { TransportService } from "./services/transport-service.js";
import { AppStore } from "./services/app-store.js";
import { SurveyRepository } from "./services/survey-repository.js";

export const appStore = new AppStore();
export const surveyRepository = new SurveyRepository();
export const mainController = new MainController({ appStore, surveyRepository });
export const transportService = new TransportService({
    transports: {
        usb: new GcUsbLink({
            componentIdentifier: "DataUnit",
            storageScope: "DataUnit",
        }),
        ble: new GcBleLink({
            componentIdentifier: "DataUnit",
            serviceUuid: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
        }),
    },
});

const dataUnit = document.getElementById("DataUnit");
if (dataUnit) {
    dataUnit.setTransportService(transportService);
    dataUnit.setConnectionControls({
        usbButton: document.getElementById("usbButton"),
        bleButton: document.getElementById("bleButton"),
        batteryIcon: document.getElementById("batteryIcon"),
    });
    dataUnit.setAppStore(appStore);
}

const jobPlanner = document.getElementById("JobPlanner");
if (jobPlanner) {
    jobPlanner.setAppStore(appStore);
}

const settingsPage = document.getElementById("SettingsPage");
if (settingsPage) {
    settingsPage.setAppStore(appStore);
}

const measurementsTable = document.getElementById("MeasurementTable");
if (measurementsTable) {
    measurementsTable.setAppStore(appStore);
}

export const mainControllerReady = mainController.loadSurveyModel().catch((error) => {
    console.error("Failed to initialize the survey model:", error);
    throw error;
});

appStore.addEventListener("measurement-recorded", async (event) => {
    try {
        await mainControllerReady;
        mainController.addMeasurement(event.detail.measurement);
    } catch (error) {
        console.error("Failed to save test measurement:", error);
    }
});

//import { loadLanguageCatalog, supportedLanguagesCatalog } from "./components/locale/locale-loader.js";
/*
let syncLangButtonState = () => {};

document.addEventListener("DOMContentLoaded", () => {
    const langSelect = document.getElementById("gcLangSelect");
    const langButton = document.getElementById("langButton");
    if (langSelect) {
        const languages = Array.isArray(supportedLanguagesCatalog?.supportedLanguages)
            ? supportedLanguagesCatalog.supportedLanguages
            : [];

        languages.forEach((lang) => {
            const option = document.createElement("option");
            option.value = lang.code;
            option.textContent = lang.label;
            langSelect.appendChild(option);
        });

        syncLangButtonState = createLanguageButtonMenu(langSelect, langButton, languages);
        syncLangButtonState();

        langSelect.addEventListener("change", (event) => {
            setAppLanguage(event.target.value);
        });
    }

});


document.addEventListener("app-language-change", (event) => {
    const langSelect = document.getElementById("gcLangSelect");
    if (langSelect) {
        langSelect.value = event.detail.code;
        syncLangButtonState();
    }
});

function createLanguageButtonMenu(langSelect, langButton, languages) {
    if (!langSelect) {
        return () => {};
    }

    langSelect.classList.add("gc-hidden-lang-select");

    if (!langButton) {
        return () => {};
    }

    const menu = document.createElement("div");
    menu.className = "gc-lang-menu";
    menu.hidden = true;
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", "Select language");

    const entries = Array.isArray(languages) ? languages : [];
    entries.forEach((lang) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "gc-lang-menu-item";
        item.dataset.langCode = lang.code;
        item.textContent = lang.label;
        item.addEventListener("click", () => {
            const nextCode = String(lang.code || "").trim().slice(0, 2).toLowerCase();
            if (!nextCode) {
                return;
            }

            if (langSelect.value !== nextCode) {
                langSelect.value = nextCode;
            }
            langSelect.dispatchEvent(new Event("change", { bubbles: true }));
            closeMenu();
        });
        menu.appendChild(item);
    });

    document.body.appendChild(menu);

    langButton.setAttribute("aria-haspopup", "listbox");
    langButton.setAttribute("aria-expanded", "false");

    function closeMenu() {
        if (menu.hidden) {
            return;
        }

        menu.hidden = true;
        langButton.setAttribute("aria-expanded", "false");
    }

    function positionMenu() {
        const buttonRect = langButton.getBoundingClientRect();
        const viewportPadding = 8;

        menu.style.left = "0px";
        menu.style.top = "0px";

        const menuRect = menu.getBoundingClientRect();

        let left = buttonRect.right - menuRect.width;
        left = Math.max(viewportPadding, left);
        left = Math.min(left, window.innerWidth - menuRect.width - viewportPadding);

        let top = buttonRect.bottom + 6;
        const bottomLimit = window.innerHeight - menuRect.height - viewportPadding;
        if (top > bottomLimit) {
            top = Math.max(viewportPadding, buttonRect.top - menuRect.height - 6);
        }

        menu.style.left = `${Math.round(left)}px`;
        menu.style.top = `${Math.round(top)}px`;
    }

    function openMenu() {
        if (!menu.hidden) {
            return;
        }

        menu.hidden = false;
        positionMenu();
        langButton.setAttribute("aria-expanded", "true");
    }

    function toggleMenu() {
        if (menu.hidden) {
            openMenu();
        } else {
            closeMenu();
        }
    }

    function syncButtonState() {
        const selectedOption = langSelect.selectedOptions?.[0] || null;
        const selectedText = selectedOption?.textContent?.trim() || "Language";
        const selectedCode = selectedOption?.value || langSelect.value || "";

        langButton.title = selectedText;
        langButton.setAttribute("aria-label", selectedText);

        const menuItems = menu.querySelectorAll(".gc-lang-menu-item");
        menuItems.forEach((item) => {
            const isActive = String(item.dataset.langCode || "") === String(selectedCode || "");
            item.classList.toggle("is-active", isActive);
            item.setAttribute("aria-selected", isActive ? "true" : "false");
        });
    }

    langButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleMenu();
    });

    menu.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!langButton.contains(target) && !menu.contains(target)) {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (!menu.hidden) {
            positionMenu();
        }
    });

    window.addEventListener("scroll", () => {
        if (!menu.hidden) {
            positionMenu();
        }
    }, true);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    return syncButtonState;
}


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
*/


