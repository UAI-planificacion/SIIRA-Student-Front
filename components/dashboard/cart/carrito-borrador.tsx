'use client';

import { useState }       from 'react';
import { Calendar, Lock, Save, ShoppingCart } from 'lucide-react';

import { Button }            from '@/components/ui/button';
import { ScrollArea }        from '@/components/ui/scroll-area';
import { useCart }           from '@/context/cart-context';
import { useStudent }        from '@/hooks/use-student';
import { CalendarioDrawer }  from '../calendar/calendario-drawer';
import { CartItem }          from './cart-item';
import { ContadorCreditos }  from './contador-creditos';

export function CarritoBorrador(): React.JSX.Element {
    const [ calendarOpen, setCalendarOpen ] = useState( false );
    const { draftSubjects, draftStatus, usedCredits, freezeDraft } = useCart();
    const { data: student } = useStudent();

    const isFrozen    = draftStatus === 'submitted';
    const totalCredits = student?.totalCredits ?? 30;

    return (
        <aside className="h-full flex flex-col bg-card relative overflow-hidden">

            {/* Overlay de candado cuando el borrador está congelado */ }
            { isFrozen && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
                    <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="size-7 text-muted-foreground" />
                    </div>
                    <div className="text-center px-6">
                        <p className="text-sm font-semibold text-foreground">Borrador congelado</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tu inscripción ha sido enviada y ya no puede modificarse.
                        </p>
                    </div>
                </div>
            ) }

            {/* Header sticky con KPI de créditos */ }
            <div className="shrink-0">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                    <ShoppingCart className="size-4 text-muted-foreground" />
                    <h2 className="text-sm font-bold text-foreground flex-1">Borrador</h2>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        { draftSubjects.length } ramos
                    </span>
                </div>

                <ContadorCreditos
                    usedCredits={ usedCredits }
                    totalCredits={ totalCredits }
                />

                {/* Botón calendario */ }
                <div className="px-4 py-3 border-b border-border">
                    <Button
                        id="open-calendar-btn"
                        variant="outline"
                        size="sm"
                        onClick={ () => setCalendarOpen( true ) }
                        disabled={ draftSubjects.length === 0 }
                        className="w-full h-9 text-xs font-medium gap-2"
                    >
                        <Calendar className="size-3.5" />
                        Visualizar Horario Completo 🗓️
                    </Button>
                </div>
            </div>

            {/* Lista de ramos */ }
            <ScrollArea className="flex-1 min-h-0">
                { draftSubjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
                        <span className="text-3xl">🛒</span>
                        <p className="text-xs text-muted-foreground">
                            Añade ramos desde el catálogo para armar tu borrador.
                        </p>
                    </div>
                ) : (
                    <div>
                        { draftSubjects.map( ( subject ) => (
                            <CartItem key={ subject.id } subject={ subject } />
                        ) ) }
                    </div>
                ) }
            </ScrollArea>

            {/* Botón congelar */ }
            { !isFrozen && (
                <div className="shrink-0 p-4 border-t border-border">
                    <Button
                        id="freeze-draft-btn"
                        onClick={ freezeDraft }
                        disabled={ draftSubjects.length === 0 }
                        className="w-full h-10 text-sm font-semibold gap-2 bg-primary hover:bg-primary/90"
                    >
                        <Save className="size-4" />
                        Guardar y Congelar Borrador
                    </Button>
                    { draftSubjects.length === 0 && (
                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                            Agrega al menos un ramo para continuar.
                        </p>
                    ) }
                </div>
            ) }

            <CalendarioDrawer
                open={ calendarOpen }
                onClose={ () => setCalendarOpen( false ) }
            />
        </aside>
    );
}
