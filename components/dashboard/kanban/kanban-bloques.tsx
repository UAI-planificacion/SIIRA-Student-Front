'use client';

import { useMemo } from 'react';

import { AlertCircle } from 'lucide-react';

import { useSubjects }           from '@/hooks/use-subjects';
import { useCart }               from '@/context/cart-context';
import type { Day, ScheduleSlot, Subject } from '@/types/siira';
import { BLOCKS, DAYS, makeSlotKey, type SlotKey } from '@/lib/blocks';
import { BlockLane }         from './block-lane';
import { BlockLaneSkeleton } from './block-lane-skeleton';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseSchedule( raw: string ): ScheduleSlot[] {
    try {
        return JSON.parse( raw ) as ScheduleSlot[];
    } catch {
        return [];
    }
}

function hasCollision( subject: Subject, cartSubjects: Subject[] ): boolean {
    const slots = parseSchedule( subject.schedule );

    return cartSubjects.some( ( cartSubj ) => {
        const cartSlots = parseSchedule( cartSubj.schedule );

        return slots.some( ( slot ) =>
            cartSlots.some( ( cs ) => cs.day === slot.day && cs.block === slot.block )
        );
    } );
}

// ─── Legend ──────────────────────────────────────────────────────────────────

function KanbanLegend(): React.JSX.Element {
    return (
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Leyenda:
            </span>

            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-8 h-5 rounded border border-emerald-500/30 bg-emerald-500/10" />
                Inscrito en carrito
            </span>

            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-8 h-5 rounded border border-dashed border-border" />
                Libre — clic para buscar
            </span>

            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-8 h-5 rounded border border-dashed border-border/40 bg-muted/10" />
                Sin ramos disponibles
            </span>
        </div>
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function KanbanBloques(): React.JSX.Element {
    const { data: subjects, isLoading, isError } = useSubjects();
    const { draftSubjects } = useCart();

    // Map slotKey → Subject from cart (O(1) lookup per cell)
    const cartSlotMap = useMemo<Map<SlotKey, Subject>>( () => {
        const map = new Map<SlotKey, Subject>();

        for ( const subject of draftSubjects ) {
            const slots = parseSchedule( subject.schedule );

            for ( const slot of slots ) {
                map.set( makeSlotKey( slot.day as Day, slot.block ), subject );
            }
        }

        return map;
    }, [ draftSubjects ] );

    // Map slotKey → Subject[] of compatible subjects (available, no collision)
    const catalogBySlot = useMemo<Map<SlotKey, Subject[]>>( () => {
        const map = new Map<SlotKey, Subject[]>();

        if ( !subjects ) return map;

        for ( const subject of subjects ) {
            // Only show available subjects not already in cart and without conflicts
            if ( subject.academicStatus !== 'available_to_enroll' ) continue;
            if ( draftSubjects.some( ( s ) => s.id === subject.id ) ) continue;
            if ( draftSubjects.length > 0 && hasCollision( subject, draftSubjects ) ) continue;

            const slots = parseSchedule( subject.schedule );

            for ( const slot of slots ) {
                const key      = makeSlotKey( slot.day as Day, slot.block );
                const existing = map.get( key ) ?? [];

                // Deduplicate (a subject may have the same block on multiple days)
                if ( !existing.some( ( s ) => s.id === subject.id ) ) {
                    map.set( key, [ ...existing, subject ] );
                }
            }
        }

        return map;
    }, [ subjects, draftSubjects ] );

    // ── Loading ───────────────────────────────────────────────────────────────
    if ( isLoading ) {
        return (
            <div className="flex-1 overflow-hidden flex flex-col">
                <KanbanLegend />

                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex gap-3 p-4 min-w-max h-full items-start">
                        { BLOCKS.map( ( block ) => (
                            <BlockLaneSkeleton key={ block } block={ block } />
                        ) ) }
                    </div>
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if ( isError || !subjects ) {
        return (
            <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground">
                <AlertCircle className="size-5 text-destructive" />
                <p className="text-sm">Error al cargar los bloques. Intente nuevamente.</p>
            </div>
        );
    }

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            <KanbanLegend />

            <div className="flex-1 overflow-x-auto overflow-y-auto">
                <div className="flex gap-3 p-4 min-w-max min-h-full items-start">
                    { BLOCKS.map( ( block ) => (
                        <BlockLane
                            key={ block }
                            block={ block }
                            cartSlotMap={ cartSlotMap }
                            catalogBySlot={ catalogBySlot }
                        />
                    ) ) }
                </div>
            </div>
        </div>
    );
}
