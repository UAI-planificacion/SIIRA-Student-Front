import { memo } from 'react';

import type { ScheduleSlot, Subject } from '@/types/siira';
import { BLOCKS, BLOCK_LABELS, DAYS, DAY_ABBR } from '@/lib/blocks';

// ─── Per-subject color palette ────────────────────────────────────────────────

const CHIP_COLORS = [
    'bg-blue-500/25   text-blue-700   border-blue-400/40   dark:text-blue-300',
    'bg-violet-500/25 text-violet-700 border-violet-400/40 dark:text-violet-300',
    'bg-emerald-500/25 text-emerald-700 border-emerald-400/40 dark:text-emerald-300',
    'bg-orange-500/25 text-orange-700 border-orange-400/40 dark:text-orange-300',
    'bg-pink-500/25   text-pink-700   border-pink-400/40   dark:text-pink-300',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseSchedule( raw: string ): ScheduleSlot[] {
    try {
        return JSON.parse( raw ) as ScheduleSlot[];
    } catch {
        return [];
    }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProposalGridPreviewProps {
    subjects  : Subject[];
    className ?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

function ProposalGridPreviewInner( { subjects, className = '' }: ProposalGridPreviewProps ): React.JSX.Element {
    // Build cellMap: "Day-Block" → { subject, colorClass }
    const cellMap = new Map<string, { subject: Subject; colorClass: string }>();

    subjects.forEach( ( subject, idx ) => {
        const slots      = parseSchedule( subject.schedule );
        const colorClass = CHIP_COLORS[ idx % CHIP_COLORS.length ] ?? CHIP_COLORS[ 0 ]!;

        slots.forEach( ( slot ) => {
            const key = `${ slot.day }-${ slot.block }`;

            if ( !cellMap.has( key ) ) {
                cellMap.set( key, { subject, colorClass } );
            }
        } );
    } );

    return (
        <div className={ `overflow-auto ${ className }` }>
            <table className="border-collapse text-[10px] w-full min-w-[380px] border border-border/60">
                {/* Header row */}
                <thead>
                    <tr className="bg-muted/20">
                        <th className="w-8 py-1.5 pr-1.5 text-right text-[9px] text-muted-foreground font-medium border-b border-r border-border/60 bg-background/50" />

                        { DAYS.map( ( day ) => (
                            <th
                                key={ day }
                                className="py-1.5 px-1 text-center font-semibold text-foreground text-[9px] border-b border-r border-border/60 last:border-r-0 min-w-[52px] bg-background/50"
                            >
                                { DAY_ABBR[ day ] }
                            </th>
                        ) ) }
                    </tr>
                </thead>

                <tbody>
                    { BLOCKS.map( ( block ) => (
                        <tr
                            key={ block }
                            className="border-b border-border/60 last:border-b-0"
                        >
                            {/* Block label */}
                            <td className="pr-1.5 text-right align-middle text-muted-foreground font-mono text-[9px] w-8 border-r border-border/60 bg-muted/10 py-1">
                                <div className="font-semibold leading-tight">B{ block }</div>
                                <div className="opacity-50 leading-tight">{ BLOCK_LABELS[ block ] }</div>
                            </td>

                            { DAYS.map( ( day ) => {
                                const key  = `${ day }-${ block }`;
                                const cell = cellMap.get( key );

                                return (
                                    <td
                                        key={ key }
                                        className="px-1 py-1 align-middle border-r border-border/60 last:border-r-0"
                                    >
                                        { cell && (
                                            <div className={ [
                                                'rounded border px-1 py-0.5 leading-tight',
                                                cell.colorClass,
                                            ].join( ' ' ) }>
                                                <p className="font-semibold line-clamp-2 text-[9px]">
                                                    { cell.subject.name }
                                                </p>
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
    );
}

export const ProposalGridPreview = memo( ProposalGridPreviewInner );
