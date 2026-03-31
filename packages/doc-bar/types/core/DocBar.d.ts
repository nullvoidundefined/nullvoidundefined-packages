export interface DocBarOptions {
    basePath?: string;
    position?: 'top' | 'bottom';
    fixed?: boolean;
    appName?: string;
    theme?: 'dark' | 'light';
}
export interface NavLink {
    key: string;
    label: string;
    file: string;
}
export declare class DocBar {
    private options;
    private _container;
    private _modal;
    private _activeBtn;
    private _abortController;
    private _docsAvailable;
    constructor(options?: DocBarOptions);
    mount(container: HTMLElement): Promise<void>;
    destroy(): void;
    private _checkDocs;
    private _renderNav;
    private _openModal;
    private _open;
    private _buildMarkdown;
    private _closeModal;
    private _onKeyDown;
}
