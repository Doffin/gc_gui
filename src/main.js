import "./components/gc-message-area.js";
import "./components/gc-table.js";
import "./components/gc-realtime.js";
import "./components/gc-measurements-table.js";
import "./components/gc-dataunit.js";
import "./components/gc-pump-control.js";
import "./components/gc-procedure-bar.js";
import "./components/gc-graph.js";
import "./components/gc-usblink.js";
import "./components/gc-blelink.js";

import { loadLanguageCatalog, supportedLanguagesCatalog } from "./components/locale/locale-loader.js";

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



