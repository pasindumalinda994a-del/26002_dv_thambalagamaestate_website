export const AMBIENT_SOUND_EVENT = "te-ambient-sound";
export const SOUND_PREFERENCE_KEY = "te-sound-preference";

export type AmbientSoundDetail = { enabled: boolean };

export function dispatchAmbientSoundPreference(enabled: boolean) {
  try {
    sessionStorage.setItem(SOUND_PREFERENCE_KEY, enabled ? "1" : "0");
  } catch {
    /* private mode / blocked storage */
  }

  window.dispatchEvent(
    new CustomEvent<AmbientSoundDetail>(AMBIENT_SOUND_EVENT, {
      detail: { enabled },
    }),
  );
}

export function getAmbientSoundPreference(): boolean | null {
  try {
    const value = sessionStorage.getItem(SOUND_PREFERENCE_KEY);
    if (value === "1") return true;
    if (value === "0") return false;
  } catch {
    /* private mode / blocked storage */
  }
  return null;
}
