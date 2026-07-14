'use client';

import { memo } from 'react';

import { Plus } from 'lucide-react';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import type { Day, Subject } from '@/types/siira';
import {
    BLOCK_LABELS,
    DAYS,
    DAY_ABBR,
    makeSlotKey,
    type SlotKey,
} from '@/lib/blocks';
import { BlockCatalogPanel } from './block-catalog-panel';

// ─── Occupied day cell ────────────────────────────────────────────────────────

interface OccupiedCellProps {
    subject : Subject;
}

function OccupiedCell( { subject }: OccupiedCellProps ): React.JSX.Element {
    return (
        <div className="flex-1 min-w-0 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 overflow-hidden">
            <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 truncate leading-tight">
                { subject.name }
            </p>

            <p className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 truncate leading-tight mt-0.5">
                { subject.professor }
            </p>
        </div>
    );
}

// ─── Free day cell ────────────────────────────────────────────────────────────

interface FreeCellProps {
    block    : number;
    day      : Day;
    subjects : Subject[];
}

function FreeCell( { block, day, subjects }: FreeCellProps ): React.JSX.Element {
    const hasOptions = subjects.length > 0;

    if ( !hasOptions ) {
        return (
            <div className="flex-1 rounded-lg border border-dashed border-border/50 flex items-center justify-center">
                <span className="text-[9px] text-muted-foreground/40">—</span>
            </div>
        );
    }

    return (
        <Popover>
            <PopoverTrigger
                className="flex-1 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-150 group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
            >
                <div className="flex items-center justify-center gap-1 h-full px-1.5">
                    <Plus className="size-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />

                    <span className="text-[9px] text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                        { subjects.length } ramos
                    </span>
                </div>
            </PopoverTrigger>

            <PopoverContent
                side="bottom"
                align="start"
                sideOffset={ 4 }
            >
                <BlockCatalogPanel
                    block={ block }
                    day={ day }
                    subjects={ subjects }
                />
            </PopoverContent>
        </Popover>
    );
}

// ─── Day row ──────────────────────────────────────────────────────────────────

interface DayRowProps {
    block           : number;
    day             : Day;
    cartSubject     : Subject | undefined;
    catalogSubjects : Subject[];
}

function DayRow( { block, day, cartSubject, catalogSubjects }: DayRowProps ): React.JSX.Element {
    const abbr = DAY_ABBR[ day ];

    return (
        <div className="flex items-stretch gap-2 h-10">
            {/* Day label */}
            <span className="text-[10px] font-medium text-muted-foreground w-4 shrink-0 flex items-center">
                { abbr }
            </span>

            {/* Cell content */}
            { cartSubject ? (
                <OccupiedCell subject={ cartSubject } />
            ) : (
                <FreeCell
                    block={ block }
                    day={ day }
                    subjects={ catalogSubjects }
                />
            ) }
        </div>
    );
}

// ─── Block lane ───────────────────────────────────────────────────────────────

interface BlockLaneProps {
    block         : number;
    cartSlotMap   : Map<SlotKey, Subject>;
    catalogBySlot : Map<SlotKey, Subject[]>;
}

function BlockLaneInner( { block, cartSlotMap, catalogBySlot }: BlockLaneProps ): React.JSX.Element {
    const label = BLOCK_LABELS[ block ];

    const occupiedCount = DAYS.filter(
        ( day ) => cartSlotMap.has( makeSlotKey( day, block ) )
    ).length;

    const isFullyOccupied = occupiedCount === DAYS.length;
    const isPartiallyOccupied = occupiedCount > 0 && !isFullyOccupied;

    return (
        <div className={ [
            'flex flex-col gap-2 w-52 shrink-0 rounded-xl border p-3 transition-colors',
            isFullyOccupied
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : isPartiallyOccupied
                    ? 'border-primary/20 bg-background'
                    : 'border-border bg-background',
        ].join( ' ' ) }>
            {/* Header */}
            <div className="text-center pb-2 border-b border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Bloque { block }
                </p>

                <p className="text-sm font-bold text-foreground tabular-nums">
                    { label }
                </p>

                {/* Occupation badge */}
                { occupiedCount > 0 && (
                    <p className={ [
                        'text-[9px] font-medium mt-0.5',
                        isFullyOccupied
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-primary/70',
                    ].join( ' ' ) }>
                        { occupiedCount }/{ DAYS.length } días ocupados
                    </p>
                ) }
            </div>

            {/* Day rows */}
            <div className="flex flex-col gap-1.5">
                { DAYS.map( ( day ) => {
                    const key           = makeSlotKey( day, block );
                    const cartSubject   = cartSlotMap.get( key );
                    const catalogForSlot = catalogBySlot.get( key ) ?? [];

                    return (
                        <DayRow
                            key={ day }
                            block={ block }
                            day={ day }
                            cartSubject={ cartSubject }
                            catalogSubjects={ catalogForSlot }
                        />
                    );
                } ) }
            </div>
        </div>
    );
}

export const BlockLane = memo( BlockLaneInner );
