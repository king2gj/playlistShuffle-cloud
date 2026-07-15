const STORAGE_KEY = "volume";

export function readStoredVolume() {
    return localStorage.getItem(STORAGE_KEY);
}

export function writeStoredVolume(volume) {
    localStorage.setItem(STORAGE_KEY, String(volume));
}