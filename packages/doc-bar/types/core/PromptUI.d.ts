export interface NavLink {
    key: string;
    label: string;
    file: string;
}
type PromptReason = 'missing' | 'unversioned' | 'outdated';
export declare function buildGenerateUI(basePath: string, navLinks: NavLink[]): HTMLElement;
export declare function buildPromptUI(key: string, reason: PromptReason, file: string, basePath: string): HTMLElement;
export {};
