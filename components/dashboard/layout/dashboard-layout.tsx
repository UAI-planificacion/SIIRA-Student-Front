'use client';

import { Calendar, AlertOctagon } from 'lucide-react';

import { useCart }          from '@/context/cart-context';
import { useFilters }       from '@/context/filters-context';
import { useExecutionMode } from '@/hooks/use-execution-mode';
import { CarritoBorrador }  from '../cart/carrito-borrador';
import { CatalogoCentral }  from '../catalog/catalogo-central';
import { SidebarFiltros }   from '../sidebar/sidebar-filtros';


export function DashboardLayout(): React.JSX.Element {
    const {
        mode,
        studentStartDate,
        isLoading
    }                       = useExecutionMode();
    const { isSidebarOpen } = useFilters();
    const { isCartOpen }    = useCart();

    // Pantalla de carga inicial mientras se detecta el modo de ejecución
    if ( isLoading ) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-xs text-muted-foreground animate-pulse">Cargando tu sesión académica...</p>
                </div>
            </div>
        );
    }

    // 1. Pantalla de bloqueo si el proceso finalizó
    if ( mode === 'finalizado' ) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-destructive/10 via-background to-background" />

                <div className="relative max-w-md w-full bg-card/65 backdrop-blur-md rounded-2xl border border-border/60 shadow-xl p-8 flex flex-col items-center text-center">
                    <div className="size-16 rounded-full bg-destructive/15 border border-destructive/20 flex items-center justify-center text-destructive mb-5 animate-bounce">
                        <AlertOctagon className="size-8" />
                    </div>

                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                        Proceso Finalizado
                    </h2>

                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        El proceso de inscripción y toma de asignaturas correspondiente a este período ha concluido formalmente. 
                    </p>

                    <div className="w-full h-px bg-border/60 my-6" />

                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Si requieres asistencia o modificaciones excepcionales en tu carga académica, por favor ponte en contacto con la secretaría académica de la universidad.
                    </p>
                </div>
            </div>
        );
    }

    // 2. Pantalla de bloqueo si está esperando prioridad de turno
    if ( mode === 'esperando_prioridad' ) {
        const formattedDate = studentStartDate
            ? studentStartDate.toLocaleString( 'es-CL', {
                weekday : 'long',
                year    : 'numeric',
                month   : 'long',
                day     : 'numeric',
                hour    : '2-digit',
                minute  : '2-digit',
            } )
            : 'fecha no definida';

        return (
            <div className="h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

                <div className="relative max-w-md w-full bg-card/65 backdrop-blur-md rounded-2xl border border-border/60 shadow-xl p-8 flex flex-col items-center text-center">
                    <div className="size-16 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary mb-5">
                        <Calendar className="size-8" />
                    </div>

                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                        Espera tu Prioridad de Turno
                    </h2>

                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        El proceso formal de Toma de Ramos está activo, pero aún no inicia tu bloque de inscripción asignado.
                    </p>

                    <div className="w-full bg-muted/40 rounded-xl border border-border/40 p-4 my-6">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Tu horario de prioridad es:
                        </span>
                        <strong className="text-sm font-bold text-primary block mt-1 capitalize">
                            { formattedDate }
                        </strong>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Una vez llegada la fecha y hora indicadas, la plataforma se habilitará automáticamente para que registres tus asignaturas.
                    </p>
                </div>
            </div>
        );
    }

    // El carrito solo se muestra si el modo no es toma_ramos
    const showCart = mode !== 'toma_ramos' && isCartOpen;

    return (
        <div className="h-full w-full overflow-hidden flex bg-background">
            {/* Sidebar Container */}
            <div
                className = {([
                    'h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out',
                    isSidebarOpen
                        ? 'w-65 opacity-100 border-r border-border'
                        : 'w-0 opacity-0 invisible border-r-0 pointer-events-none',
                ].join( ' ' ))}
            >
                <div className="w-65 h-full">
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
                    showCart
                        ? 'w-70 opacity-100 border-l border-border'
                        : 'w-0 opacity-0 invisible border-l-0 pointer-events-none',
                ].join( ' ' ))}
            >
                <div className="w-70 h-full">
                    <CarritoBorrador />
                </div>
            </div>
        </div>
    );
}
