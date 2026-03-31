/**
 * Shared DOM helpers used across all modules.
 */
export declare function el(tag: string, className?: string, attrs?: Record<string, string>): HTMLElement;
export declare function createOverlay(onClose: () => void): HTMLElement;
export declare function createPanel(className: string, title: string, onClose: () => void): {
    panel: HTMLElement;
    body: HTMLElement;
};
export declare function createLoadingSkeleton(): HTMLElement;
