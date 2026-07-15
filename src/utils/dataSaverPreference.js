const STORAGE_KEY = 'dataSaverMode';

export function readDataSaverPreferences() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function writeDataSaverPreference(isActive) {
    localStorage.setItem(STORAGE_KEY, String(isActive));
}