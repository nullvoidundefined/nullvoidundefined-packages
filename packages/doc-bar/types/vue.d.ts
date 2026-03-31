import { DefineComponent } from 'vue';

interface AppDocBarProps {
    basePath?: string;
    position?: 'top' | 'bottom';
    fixed?: boolean;
    appName?: string;
    theme?: 'dark' | 'light';
}

declare const AppDocBar: DefineComponent<AppDocBarProps>;
export default AppDocBar;
