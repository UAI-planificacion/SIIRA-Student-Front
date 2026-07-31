'use client';

import { useCallback, useRef, useState } from 'react';

import { X } from 'lucide-react';

import type {
    ScheduleSlot,
    Subject,
}                       from '@/types/siira';
import { useCart }      from '@/context/cart-context';
import { GridTooltip }  from './grid-tooltip';

// ─── Constants ───────────────────────────────────────────────────────────────
const DAYS: ScheduleSlot['day'][] = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
];


const BLOCKS = [ 1, 2, 3, 4, 5, 6, 7, 8 ];


const BLOCK_LABELS: Record<number, string> = {
    1 : '07:30',
    2 : '08:50',
    3 : '10:10',
    4 : '11:30',
    5 : '12:50',
    6 : '14:10',
    7 : '15:30',
    8 : '16:50',
};


const CATALOG_COLORS = {
    required : 'bg-blue-500/20   text-blue-700   border-blue-400/50   dark:text-blue-300   dark:border-blue-500/40',
    elective : 'bg-violet-500/20 text-violet-700 border-violet-400/50 dark:text-violet-300 dark:border-violet-500/40',
    inCart   : 'bg-emerald-500/20 text-emerald-700 border-emerald-400/50 dark:text-emerald-300 ring-1 ring-emerald-500/40',
};


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

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseSchedule( raw: string ): ScheduleSlot[] {
    try {
        return JSON.parse( raw ) as ScheduleSlot[];
    } catch {
        return [];
    }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function HorarioGridSkeleton(): React.JSX.Element {
    return (
        <div className="overflow-auto h-full p-3">
            <div className="min-w-125 space-y-2 animate-pulse">
                <div className="grid grid-cols-[56px_repeat(6,1fr)] gap-1">
                    <div />
                    { DAYS.map( ( d ) => (
                        <div key={ d } className="h-6 rounded bg-muted" />
                    ) ) }
                </div>

                { BLOCKS.map( ( b: number, bIdx: number ) => {
                    return <div key={ b } className="grid grid-cols-[56px_repeat(6,1fr)] gap-1">
                        <div className="h-10 rounded bg-muted/60" />
                        { DAYS.map( ( d: ScheduleSlot['day'], dIdx: number ) => {
                            const opacityVal: number = ( bIdx + dIdx ) % 3 === 0 ? 1 : 0.3;
                            return <div
                                key={ d }
                                className="h-10 rounded bg-muted/40"
                                style={ { opacity: opacityVal } }
                            />;
                        } ) }
                    </div>;
                } ) }
            </div>
        </div>
    );
}

// ─── Catalog Chip ─────────────────────────────────────────────────────────────
interface CatalogChipProps {
    subject  : Subject;
    onHover  : ( subject: Subject, e: React.MouseEvent ) => void;
    onLeave  : () => void;
}


function CatalogChip( { subject, onHover, onLeave }: CatalogChipProps ): React.JSX.Element {
    const { isInCart } = useCart();

    const inCart = isInCart( subject.id );

    const color = inCart
        ? CATALOG_COLORS.inCart
        : subject.isRequired
            ? CATALOG_COLORS.required
            : CATALOG_COLORS.elective;

    return (
        <div
            onMouseEnter = { ( e ) => onHover( subject, e ) }
            onMouseLeave = { onLeave }
            className    = {([
                'rounded-md border px-1.5 py-1 cursor-default',
                'transition-shadow duration-150 hover:shadow-md hover:shadow-black/10',
                color,
            ].join( ' ' ))}
        >
            <p className="text-[10px] font-semibold leading-tight line-clamp-2 select-none">
                { subject.name }
            </p>

            { subject.quotas === 0 ? (
                <span className="text-[9px] text-destructive font-medium animate-pulse">Sin cupos</span>
            ) : subject.quotas < 5 ? (
                <span className="text-[9px] text-orange-500 font-medium animate-pulse">{ subject.quotas } cupos</span>
            ) : (
                <span className="text-[9px] text-emerald-500 font-medium animate-pulse">{ subject.quotas } cupos</span>
            ) }
        </div>
    );
}

// ─── Tooltip State ────────────────────────────────────────────────────────────
interface TooltipState {
    subject : Subject;
    x       : number;
    y       : number;
    alignX  : 'left' | 'right';
    alignY  : 'top' | 'bottom';
}

// ─── Component Props ──────────────────────────────────────────────────────────
interface HorarioGridCatalogProps {
    mode       : 'catalog';
    subjects   : Subject[];
    isLoading? : boolean;
}


interface HorarioGridCartProps {
    mode       : 'cart';
    subjects   : Subject[];
    isLoading? : boolean;
    onRemove?  : ( id: string ) => void;
    isFrozen?  : boolean;
}

type HorarioGridProps = HorarioGridCatalogProps | HorarioGridCartProps;

// ─── Main HorarioGrid Component ──────────────────────────────────────────────
export function HorarioGrid( props: HorarioGridProps ): React.JSX.Element {
    const { mode, subjects, isLoading } = props;

    const [ tooltip, setTooltip ] = useState<TooltipState | null>( null );
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>( null );


    const handleChipHover = useCallback( ( subject: Subject, e: React.MouseEvent ) => {
        if ( hideTimer.current ) clearTimeout( hideTimer.current );

        const rect  = ( e.currentTarget as HTMLElement ).getBoundingClientRect();
        const slots = parseSchedule( subject.schedule );

        // Determine if it should open to the left (Friday, Saturday)
        const isFridayOrSaturday = slots.some( ( s ) => s.day === 'Viernes' || s.day === 'Sábado' );
        const alignX = isFridayOrSaturday ? 'left' : 'right';

        // Determine if it should open upwards (block >= 6)
        const isLowerBlock = slots.some( ( s ) => s.block >= 6 );
        const alignY = isLowerBlock ? 'bottom' : 'top';

        // Coordinates based on side alignment
        const xPos = alignX === 'left' ? rect.left : rect.right;
        const yPos = rect.top;

        setTooltip({
            subject : subject,
            x       : xPos,
            y       : yPos,
            alignX  : alignX,
            alignY  : alignY,
        });
    }, [] );


    const handleChipLeave = useCallback( () => {
        hideTimer.current = setTimeout( () => {
            setTooltip( null );
        }, 150 ); // Hover bridge: delay to allow mouse transfer to tooltip
    }, [] );


    const handleTooltipEnter = useCallback( () => {
        if ( hideTimer.current ) clearTimeout( hideTimer.current );
    }, [] );


    const handleTooltipLeave = useCallback( () => {
        setTooltip( null );
    }, [] );

    // Cell mapping building
    const cellMap = (() => {
        const map = new Map<string, { subject: Subject; cartIndex: number }[]>();
        const cartIndexMap = new Map<string, number>();

        if ( mode === 'cart' ) {
            subjects.forEach( ( s, i ) => cartIndexMap.set( s.id, i ) );
        }

        subjects.forEach( ( subject ) => {
            const slots = parseSchedule( subject.schedule );

            slots.forEach( ( slot ) => {
                const key = `${ slot.day }-${ slot.block }`;
                const existing = map.get( key ) ?? [];

                existing.push({
                    subject   : subject,
                    cartIndex : cartIndexMap.get( subject.id ) ?? 0,
                });
                map.set( key, existing );
            } );
        } );

        return map;
    } )();

    if ( isLoading ) return <HorarioGridSkeleton />;

    return (
        <>
            <div className="overflow-auto h-full">
                <table className="border-collapse text-xs w-full min-w-135 border border-neutral-300 dark:border-neutral-700">
                    <thead>
                        <tr className="bg-muted/30">
                            <th className="w-14 py-2.5 text-right pr-3 text-muted-foreground font-medium text-[11px] border-b border-r border-neutral-300 dark:border-neutral-700 bg-background/50">
                                Módulo
                            </th>

                            { DAYS.map( ( day ) => (
                                <th
                                    key       = { day }
                                    className = "py-2.5 px-2 text-center font-semibold text-foreground text-xs border-b border-r border-neutral-300 dark:border-neutral-700 last:border-r-0 min-w-20 bg-background/50"
                                >
                                    { day }
                                </th>
                            ) ) }
                        </tr>
                    </thead>

                    <tbody>
                        { BLOCKS.map( ( block ) => (
                            <tr key={ block } className="border-b border-neutral-300 dark:border-neutral-700 last:border-b-0">
                                <td className="pr-3 text-right align-top pt-2.5 text-muted-foreground font-mono text-[10px] w-14 border-r border-neutral-300 dark:border-neutral-700 bg-muted/10">
                                    <div className="font-semibold">B{ block }</div>
                                    <div className="text-[9px] opacity-50">
                                        { BLOCK_LABELS[ block ] }
                                    </div>
                                </td>

                                { DAYS.map( ( day ) => {
                                    const key   = `${ day }-${ block }`;
                                    const items = cellMap.get( key ) ?? [];

                                    if ( mode === 'catalog' ) {
                                        return (
                                            <td
                                                key       = { key }
                                                className = "px-2 py-2 align-top border-r border-neutral-300 dark:border-neutral-700 last:border-r-0 hover:bg-muted/20 transition-colors"
                                            >
                                                { items.length > 0 && (
                                                    <div className="flex flex-col gap-1.5" style={{ minWidth: 80 }}>
                                                        { items.map( ( { subject } ) => (
                                                            <CatalogChip
                                                                key      = { subject.id }
                                                                subject  = { subject }
                                                                onHover  = { handleChipHover }
                                                                onLeave  = { handleChipLeave }
                                                            />
                                                        ) ) }
                                                    </div>
                                                ) }
                                            </td>
                                        );
                                    }

                                    const occupant = items[ 0 ];
                                    const isFrozen = 'isFrozen' in props ? props.isFrozen : false;
                                    const onRemove = 'onRemove' in props ? props.onRemove : undefined;

                                    return (
                                        <td
                                            key       = { key }
                                            className = "px-2 py-2 align-top border-r border-neutral-300 dark:border-neutral-700 last:border-r-0 hover:bg-muted/20 transition-colors"
                                        >
                                            { occupant && (
                                                <div
                                                    className = {([
                                                        'group relative rounded-md border px-1.5 py-1.5 cursor-default',
                                                        'transition-shadow duration-150 hover:shadow-sm',
                                                        CART_COLORS[ occupant.cartIndex % CART_COLORS.length ] ?? '',
                                                    ].join( ' ' ))}
                                                    style     = {{ minWidth: 80 }}
                                                >
                                                    <p className="font-semibold text-[10px] leading-tight line-clamp-2 pr-4 select-none">
                                                        { occupant.subject.name }
                                                    </p>

                                                    { occupant.subject.quotas === 0 ? (
                                                        <span className="text-[9px] text-destructive">Sin cupos</span>
                                                    ) : (
                                                        <span className="text-[9px] opacity-70">
                                                            { occupant.subject.quotas } cupos
                                                        </span>
                                                    ) }

                                                    { !isFrozen && onRemove && (
                                                        <button
                                                            id        = { `grid-remove-${ occupant.subject.id }-${ day }-${ block }` }
                                                            onClick   = { () => onRemove( occupant.subject.id ) }
                                                            aria-label = { `Remover ${ occupant.subject.name }` }
                                                            className = {([
                                                                'absolute top-0.5 right-0.5 size-4 rounded flex items-center justify-center',
                                                                'opacity-0 group-hover:opacity-100 transition-opacity',
                                                                'bg-background/60 hover:bg-background/90 text-foreground',
                                                            ].join( ' ' ))}
                                                        >
                                                            <X className="size-2.5" />
                                                        </button>
                                                    ) }
                                                </div>
                                            ) }
                                        </td>
                                    );
                                } ) }
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>

            { mode === 'catalog' && tooltip && (
                <GridTooltip
                    subject      = { tooltip.subject }
                    section      = { tooltip.subject.sections?.[ 0 ] ?? {
                        id          : `${ tooltip.subject.id }-sec-1`,
                        label       : 'Sec 1',
                        professor   : tooltip.subject.professor,
                        schedule    : tooltip.subject.schedule,
                        quotas      : tooltip.subject.quotas,
                        capacity    : 45,
                        ssec        : `${ tooltip.subject.id }-1`,
                        sessionName : 'Asignatura',
                        building    : null,
                        spaceType   : null,
                        spaceId     : null,
                        isEnglish   : false,
                        profEmail   : null,
                        day         : 'Lunes',
                        timeLabel   : '08:15 - 09:25',
                    } }
                    x            = { tooltip.x }
                    y            = { tooltip.y }
                    alignX       = { tooltip.alignX }
                    alignY       = { tooltip.alignY }
                    onMouseEnter = { handleTooltipEnter }
                    onMouseLeave = { handleTooltipLeave }
                    onClose      = { () => setTooltip( null ) }
                />
            ) }
        </>
    );
}
