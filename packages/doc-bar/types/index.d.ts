import { ComponentProps } from 'react';

interface AppDocBarProps {
    basePath?: string;
    position?: 'top' | 'bottom';
    fixed?: boolean;
    appName?: string;
    theme?: 'dark' | 'light';
}

export default function AppDocBar(props: AppDocBarProps): JSX.Element;
