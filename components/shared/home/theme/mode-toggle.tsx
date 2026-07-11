'use client';

import { useEffect, useState } from 'react';

import { Moon, Sun } from 'lucide-react';
import { useTheme }  from 'next-themes';

import { Button } from '@/components/ui/button';

export function ModeToggle(): React.JSX.Element {
    const { theme, setTheme } = useTheme();
    const [ mounted, setMounted ] = useState( false );

    useEffect( () => {
        setMounted( true );
    }, [] );

    const toggleTheme = (): void => {
        setTheme( theme === 'dark' ? 'light' : 'dark' );
    };

    // Render placeholder during SSR to avoid hydration mismatch.
    // The theme value is not available on the server, so we defer rendering
    // any theme-dependent attributes until after client mount.
    if ( !mounted ) {
        return (
            <div className="h-9 w-9 rounded-lg" />
        );
    }

    return (
        <Button
            variant   = "ghost"
            size      = "icon"
            onClick   = { toggleTheme }
            className = "h-9 w-9 rounded-lg transition-all hover:bg-accent"
            title     = { theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro' }
        >
            <Sun  className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
