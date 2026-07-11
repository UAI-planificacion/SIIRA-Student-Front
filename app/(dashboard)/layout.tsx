'use client';

import { CartProvider }    from '@/context/cart-context';
import { FiltersProvider } from '@/context/filters-context';

interface DashboardGroupLayoutProps {
    children : React.ReactNode;
}

/**
 * Layout para el grupo de rutas (dashboard).
 * Provee CartProvider y FiltersProvider a todos los componentes de la sección.
 */
export default function DashboardGroupLayout( { children }: DashboardGroupLayoutProps ): React.JSX.Element {
    return (
        <CartProvider>
            <FiltersProvider>
                { children }
            </FiltersProvider>
        </CartProvider>
    );
}
