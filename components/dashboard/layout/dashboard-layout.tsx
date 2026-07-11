'use client';

import { useCart }    from '@/context/cart-context';
import { useFilters } from '@/context/filters-context';
import { CarritoBorrador } from '../cart/carrito-borrador';
import { CatalogoCentral } from '../catalog/catalogo-central';
import { SidebarFiltros }  from '../sidebar/sidebar-filtros';

export function DashboardLayout(): React.JSX.Element {
    const { isSidebarOpen } = useFilters();
    const { isCartOpen }    = useCart();

    return (
        <div className="h-screen w-full overflow-hidden flex bg-background">
            {/* Sidebar Container */}
            <div
                className = {([
                    'h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out',
                    isSidebarOpen
                        ? 'w-[260px] opacity-100 border-r border-border'
                        : 'w-0 opacity-0 invisible border-r-0 pointer-events-none',
                ].join( ' ' ))}
            >
                <div className="w-[260px] h-full">
                    <SidebarFiltros />
                </div>
            </div>

            {/* Central content */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300">
                <CatalogoCentral />
            </main>

            {/* Cart Container */}
            <div
                className = {([
                    'h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out',
                    isCartOpen
                        ? 'w-[280px] opacity-100 border-l border-border'
                        : 'w-0 opacity-0 invisible border-l-0 pointer-events-none',
                ].join( ' ' ))}
            >
                <div className="w-[280px] h-full">
                    <CarritoBorrador />
                </div>
            </div>
        </div>
    );
}
