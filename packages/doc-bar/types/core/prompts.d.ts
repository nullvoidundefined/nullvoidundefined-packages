/**
 * Embedded generation prompts for each document type.
 * Imported as raw strings at build time via Vite's ?raw suffix.
 *
 * DOC_FORMAT_VERSION is incremented only when the expected document format
 * changes in a breaking way (e.g. new required sections, changed quiz syntax).
 * It is independent of the package version.
 */
export declare const DOC_FORMAT_VERSION = 1;
export declare const VERSION_COMMENT = "<!-- @bottomlessmargaritas/doc-bar format:1 -->";
export declare const PROMPTS: Record<string, string>;
export declare const COMBINED_PROMPT: string;
/**
 * Parses the format version from the first line of a document.
 * Returns the version number, or null if the stamp is missing.
 */
export declare function parseDocVersion(text: string): number | null;
