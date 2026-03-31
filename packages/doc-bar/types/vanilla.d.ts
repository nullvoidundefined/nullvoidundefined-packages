export interface DocBarOptions {
    basePath?: string;
    position?: 'top' | 'bottom';
    fixed?: boolean;
    appName?: string;
    theme?: 'dark' | 'light';
}

export declare class DocBar {
    constructor(options?: DocBarOptions);
    /** Mounts the doc-bar into the given container. Async — checks doc availability on mount. */
    mount(container: HTMLElement): Promise<void>;
    /** Removes the doc-bar and cleans up event listeners. */
    destroy(): void;
}

/**
 * Creates a container div, prepends it to document.body, and mounts
 * a DocBar instance. Returns the DocBar instance.
 */
export declare function inject(options?: DocBarOptions): DocBar;
