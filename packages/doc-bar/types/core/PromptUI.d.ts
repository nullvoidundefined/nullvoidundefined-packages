import type { NavLink } from './DocBar.ts';
type PromptReason = 'missing' | 'unversioned' | 'outdated';
export declare function buildGenerateUI(basePath: string, navLinks: NavLink[]): HTMLElement;
export declare function buildPromptUI(key: string, reason: PromptReason, file: string, basePath: string): HTMLElement;
export {};
