'use client';

import { memo } from 'react';

import { MallaNode } from './malla-node';
import type { Subject } from '@/types/siira';

// ─── Status legend dot ────────────────────────────────────────────────────────

const SEMESTER_ACCENT_COLORS: Record<number, string> = {
    1  : 'bg-slate-400',
    2  : 'bg-slate-400',
    3  : 'bg-blue-500',
    4  : 'bg-blue-500',
    5  : 'bg-indigo-500',
    6  : 'bg-violet-500',
    7  : 'bg-violet-500',
    8  : 'bg-purple-500',
    9  : 'bg-fuchsia-500',
    10 : 'bg-pink-500',
    11 : 'bg-rose-500',
    12 : 'bg-red-500',
};

function getAccentColor( semester: number ): string {
    return SEMESTER_ACCENT_COLORS[ semester ] ?? 'bg-muted-foreground';
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SemesterColumnProps {
    semester           : number;
    subjects           : Subject[];
    scrollContainerRef : React.RefObject<HTMLDivElement | null>;
}

function SemesterColumnInner( { semester, subjects, scrollContainerRef }: SemesterColumnProps ): React.JSX.Element {
    const accent       = getAccentColor( semester );
    const approvedCount = subjects.filter( ( s ) => s.academicStatus === 'approved' ).length;

    return (
        <div className="flex flex-col gap-2 w-44 shrink-0">
            {/* Column header */}
            <div className="flex items-center gap-2 px-1 mb-1">
                <div className={ `size-2 rounded-full shrink-0 ${ accent }` } />

                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Semestre { semester }
                </h3>

                { approvedCount > 0 && (
                    <span className="text-[10px] text-emerald-500 font-medium ml-auto">
                        { approvedCount }/{ subjects.length }✓
                    </span>
                ) }
            </div>

            {/* Divider */}
            <div className={ `h-px ${ accent } opacity-30 mx-1 mb-1` } />

            {/* Nodes */}
            <div className="flex flex-col gap-2">
                { subjects.map( ( subject ) => (
                    <MallaNode
                        key={ subject.id }
                        subject={ subject }
                        scrollContainerRef={ scrollContainerRef }
                    />
                ) ) }
            </div>
        </div>
    );
}

export const SemesterColumn = memo( SemesterColumnInner );
