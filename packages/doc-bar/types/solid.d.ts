import { Component } from 'solid-js';

interface AppDocBarProps {
    basePath?: string;
    position?: 'top' | 'bottom';
    fixed?: boolean;
    appName?: string;
    theme?: 'dark' | 'light';
}

declare const AppDocBar: Component<AppDocBarProps>;
export default AppDocBar;
