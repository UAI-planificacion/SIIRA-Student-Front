'use client';

import { X } from 'lucide-react';

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { useCart }         from '@/context/cart-context';
import { HorarioGrid }     from '../shared/grid/horario-grid';
import { buttonVariants }  from '@/components/ui/button';
import { cn }              from '@/lib/utils';

// Cart color palette legend (mirrors the colors in HorarioGrid cart mode)
const CART_COLORS = [
    'bg-blue-500/20   text-blue-700   border-blue-500/40   dark:text-blue-300',
    'bg-violet-500/20 text-violet-700 border-violet-500/40 dark:text-violet-300',
    'bg-emerald-500/20 text-emerald-700 border-emerald-500/40 dark:text-emerald-300',
    'bg-orange-500/20 text-orange-700 border-orange-500/40 dark:text-orange-300',
    'bg-pink-500/20   text-pink-700   border-pink-500/40   dark:text-pink-300',
    'bg-cyan-500/20   text-cyan-700   border-cyan-500/40   dark:text-cyan-300',
    'bg-yellow-500/20 text-yellow-700 border-yellow-500/40 dark:text-yellow-300',
    'bg-rose-500/20   text-rose-700   border-rose-500/40   dark:text-rose-300',
];

interface CalendarioDrawerProps {
    open    : boolean;
    onClose : () => void;
}

export function CalendarioDrawer( { open, onClose }: CalendarioDrawerProps ): React.JSX.Element {
    const { draftSubjects, removeSubject, draftStatus } = useCart();
    const isFrozen = draftStatus === 'submitted';

    return (
        <Drawer
            open={ open }
            onOpenChange={ ( v ) => { if ( !v ) onClose(); } }
            swipeDirection="left"
        >
            <DrawerContent className="w-full max-w-4xl h-full rounded-none flex flex-col">
                <DrawerHeader className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <DrawerTitle className="text-base font-bold">
                        🗓️ Horario Completo
                    </DrawerTitle>
                    <DrawerClose
                        id="close-calendar-btn"
                        className={cn(
                            buttonVariants({ variant: 'ghost', size: 'icon' }),
                            'size-8'
                        )}
                    >
                        <X className="size-4" />
                    </DrawerClose>
                </DrawerHeader>

                {/* Grid */}
                <div className="flex-1 overflow-hidden">
                    { draftSubjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                            <span className="text-4xl">📅</span>
                            <p className="text-sm">Añade ramos al borrador para visualizar tu horario.</p>
                        </div>
                    ) : (
                        <HorarioGrid
                            mode="cart"
                            subjects={ draftSubjects }
                            onRemove={ removeSubject }
                            isFrozen={ isFrozen }
                        />
                    ) }
                </div>

                {/* Color legend */}
                { draftSubjects.length > 0 && (
                    <div className="shrink-0 px-4 py-3 border-t border-border flex flex-wrap gap-2">
                        { draftSubjects.map( ( subject, idx ) => (
                            <span
                                key={ subject.id }
                                className={[
                                    'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium',
                                    CART_COLORS[ idx % CART_COLORS.length ] ?? '',
                                ].join( ' ' )}
                            >
                                { subject.name }
                            </span>
                        ) ) }
                    </div>
                ) }
            </DrawerContent>
        </Drawer>
    );
}
