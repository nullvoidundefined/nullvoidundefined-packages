import { FunctionComponent } from 'preact';

interface AppDocBarProps {
    basePath?: string;
    position?: 'top' | 'bottom';
    fixed?: boolean;
    appName?: string;
    theme?: 'dark' | 'light';
}

declare const AppDocBar: FunctionComponent<AppDocBarProps>;
export default AppDocBar;
