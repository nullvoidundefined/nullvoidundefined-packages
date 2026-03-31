interface DocBarOptions {
    basePath?: string;
    position?: 'top' | 'bottom';
    fixed?: boolean;
    appName?: string;
    theme?: 'dark' | 'light';
}

export declare class DocBar {
    constructor(options?: DocBarOptions);
    mount(container: HTMLElement): void;
    destroy(): void;
}

export declare function inject(options?: DocBarOptions): DocBar;
