const STORAGE_KEY = "theme";

export function readStoredTheme() {
    return localStorage.getItem(STORAGE_KEY);
}

export function writeStoredTheme(theme) {
    localStorage.setItem(STORAGE_KEY, String(theme));
}