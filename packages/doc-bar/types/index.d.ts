export interface DocBarOptions {
    basePath?: string;
    position?: 'top' | 'bottom';
    fixed?: boolean;
    appName?: string;
    theme?: 'dark' | 'light';
}

export interface AppDocBarProps extends DocBarOptions {}

export default function AppDocBar(props: AppDocBarProps): JSX.Element;
