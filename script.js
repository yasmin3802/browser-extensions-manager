
// 1. SELECT ELEMENTS

const extensionsGrid = document.getElementById("extensions-grid");
const filterButtons = document.querySelectorAll(".filter-button");

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const brandLogo = document.getElementById("brand-logo");

const confirmDialog = document.getElementById("confirm-dialog");
const cancelRemoveButton = document.getElementById("cancel-remove");
const confirmRemoveButton = document.getElementById("confirm-remove");


// 2. APPLICATION STATE

let extensions = [];
let currentFilter = "all";
let extensionToRemove = null;


// 3. LOAD EXTENSION DATA

async function loadExtensions() {

    try {

        const response = await fetch("./data.json");

        if (!response.ok) {
            throw new Error("Failed to load extension data.");
        }

        const data = await response.json();

        const savedExtensions = localStorage.getItem("extensions");

        if (savedExtensions) {

            const savedData = JSON.parse(savedExtensions);

            extensions = data.map(extension => {

                const savedExtension = savedData.find(
                    item => item.name === extension.name
                );

                return savedExtension
                    ? { ...extension, isActive: savedExtension.isActive }
                    : extension;

            });

        } else {

            extensions = data;

        }

        renderExtensions();

    } catch (error) {

        console.error("Error loading extensions:", error);

        extensionsGrid.innerHTML = `
            <p class="empty-message">
                Unable to load extensions. Please refresh the page.
            </p>
        `;

        extensionsGrid.setAttribute("aria-busy", "false");

    }

}


// 4. SAVE EXTENSIONS

function saveExtensions() {

    localStorage.setItem(
        "extensions",
        JSON.stringify(extensions)
    );

}


// 5. RENDER EXTENSION CARDS

function renderExtensions() {

    const filteredExtensions = extensions.filter(extension => {

        if (currentFilter === "active") {
            return extension.isActive;
        }

        if (currentFilter === "inactive") {
            return !extension.isActive;
        }

        return true;

    });

    extensionsGrid.innerHTML = "";

    if (filteredExtensions.length === 0) {

        extensionsGrid.innerHTML = `
            <p class="empty-message">
                No extensions found in this category.
            </p>
        `;

        extensionsGrid.setAttribute("aria-busy", "false");

        return;

    }

    filteredExtensions.forEach(extension => {

        const card = document.createElement("article");

        card.className = "extension-card";

        card.innerHTML = `
            <div class="card-info">

                <img
                    src="${escapeHTML(extension.logo)}"
                    alt=""
                    class="extension-logo"
                >

                <div class="extension-details">

                    <h2>${escapeHTML(extension.name)}</h2>

                    <p>${escapeHTML(extension.description)}</p>

                </div>

            </div>

            <div class="card-actions">

                <button
                    class="remove-button"
                    type="button"
                    data-action="remove"
                    data-name="${escapeHTML(extension.name)}"
                    aria-label="Remove ${escapeHTML(extension.name)}"
                >
                    Remove
                </button>

                <button
                    class="toggle-switch"
                    type="button"
                    role="switch"
                    aria-checked="${extension.isActive}"
                    aria-label="Toggle ${escapeHTML(extension.name)}"
                    data-action="toggle"
                    data-name="${escapeHTML(extension.name)}"
                >
                </button>

            </div>
        `;

        extensionsGrid.appendChild(card);

    });

    extensionsGrid.setAttribute("aria-busy", "false");

}


// 6. ESCAPE HTML CONTENT

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];

    });

}


// 7. FILTER EXTENSIONS

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(filterButton => {

            const isSelected = filterButton === button;

            filterButton.classList.toggle("is-selected", isSelected);

            filterButton.setAttribute(
                "aria-pressed",
                String(isSelected)
            );

        });

        renderExtensions();

    });

});


// 8. TOGGLE EXTENSIONS

extensionsGrid.addEventListener("click", event => {

    const toggleButton = event.target.closest('[data-action="toggle"]');

    if (!toggleButton) return;

    const extensionName = toggleButton.dataset.name;

    const extension = extensions.find(
        item => item.name === extensionName
    );

    if (!extension) return;

    extension.isActive = !extension.isActive;

    saveExtensions();

    renderExtensions();

});


// 9. OPEN REMOVE DIALOG

extensionsGrid.addEventListener("click", event => {

    const removeButton = event.target.closest('[data-action="remove"]');

    if (!removeButton) return;

    extensionToRemove = removeButton.dataset.name;

    confirmDialog.showModal();

});


// 10. CONFIRM REMOVAL

confirmRemoveButton.addEventListener("click", () => {

    if (!extensionToRemove) return;

    extensions = extensions.filter(
        extension => extension.name !== extensionToRemove
    );

    saveExtensions();

    extensionToRemove = null;

    confirmDialog.close();

    renderExtensions();

});


// 11. CANCEL REMOVAL

cancelRemoveButton.addEventListener("click", () => {

    extensionToRemove = null;

    confirmDialog.close();

});


// 12. APPLY THEME

function applyTheme(theme) {

    document.documentElement.dataset.theme = theme;

    if (theme === "dark") {

        themeIcon.src = "./assets/images/icon-sun.svg";

        brandLogo.src = "./assets/images/logo-dark.svg";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to light theme"
        );

    } else {

        themeIcon.src = "./assets/images/icon-moon.svg";

        brandLogo.src = "./assets/images/logo.svg";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to dark theme"
        );

    }

    localStorage.setItem("theme", theme);

}


// 13. LOAD SAVED THEME

const savedTheme = localStorage.getItem("theme") || "light";

applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {

    const currentTheme = document.documentElement.dataset.theme;

    const newTheme = currentTheme === "light" ? "dark" : "light";

    applyTheme(newTheme);

});


// 14. INITIALIZE APPLICATION

loadExtensions();
