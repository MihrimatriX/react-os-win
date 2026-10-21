/**
 * Boot / login timing constants (ms).
 * Tuned for a calmer Win11-like feel - adjust here, not inline in components.
 */

/** MSI BIOS POST screen before Win11 splash. */
export const BIOS_POST_MS = 4500;

/** Win11 boot splash (black + logo + dotted spinner). Target visibly >=6s. */
export const BOOT_SPLASH_MS = 6500; // was 4500 (prev 3000) - must feel slow

/** Logo fade-in on splash (must match loading.css). Logo stays for full BOOT_SPLASH_MS. */
export const LOGO_FADE_IN_MS = 1800; // was 1000

/** Lock screen -> password panel before typewriter starts. */
export const UNLOCK_DELAY_MS = 400; // was 280

/** Pause after unlock before first password character. */
export const TYPEWRITER_START_MS = 350; // was 180

/**
 * Per-character typewriter delay.
 * AUTO_PASSWORD "AhmetUzunkaya" (13) * 170 ~= 2210ms typing (~2.2s).
 */
export const TYPEWRITER_CHAR_MS = 170;

/** Pause after last character before signing in / desktop. */
export const POST_TYPE_PAUSE_MS = 700;

/**
 * Approximate password animation total (unlock -> desktop):
 * UNLOCK + START + 13xCHAR + POST ~= 400+350+2210+700 = 3660ms (~3.7s).
 * Typewriter visible typing alone ~= START + 13*CHAR ~= 2.5s.
 *
 * Splash alone: BOOT_SPLASH_MS = 6500ms.
 * Full cold boot ~= BIOS_POST + BOOT_SPLASH + ~3.7s login ~= 4.5+6.5+3.7 ~= 14.7s.
 */