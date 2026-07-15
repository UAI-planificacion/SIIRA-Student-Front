import type { Metadata } from 'next';

import { ThemeProvider } from 'next-themes';

import './globals.css';
import { Header }           from '@/components/shared/home/Header';
import { QueryProvider }    from '@/providers/query-provider';
import { CartProvider }     from '@/context/cart-context';
import { FiltersProvider }  from '@/context/filters-context';
import { Toaster }          from '@/components/ui/sonner';
import { Footer }           from '@/components/shared/home/footer';


export const metadata: Metadata = {
    title       : 'SIIRA — Sistema de Inscripción de Asignaturas',
    description : 'Plataforma inteligente de inscripción de asignaturas para estudiantes UAI.',
    icons       : {
        icon        : '/favicon.ico',
        shortcut    : '/favicon.ico',
        apple       : '/favicon.ico',
    },
};


interface RootLayoutProps {
    children: React.ReactNode;
}


export default function RootLayout( { children }: Readonly<RootLayoutProps> ): React.JSX.Element {
    return (
        <html
            lang             = "es"
            suppressHydrationWarning
        >
            <body className="min-h-screen flex flex-col">
                <ThemeProvider
                    attribute        = "class"
                    defaultTheme     = "light"
                    enableSystem     = { false }
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        <CartProvider>
                            <FiltersProvider>
                                <Header />

                                <main className="flex-1">
                                    { children }
                                </main>

                                <Footer />

                                <Toaster />
                            </FiltersProvider>
                        </CartProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
