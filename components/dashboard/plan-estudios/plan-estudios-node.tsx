'use client';

import { memo } from 'react';

import { Check, CheckCircle2, Clock } from 'lucide-react';

import { Badge }   from '@/components/ui/badge';
import type { Subject } from '@/types/siira';
import { SectionPill } from './section-pill';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlanEstudiosNodeProps {
    subject         : Subject;
    highlightYellow : boolean; // Is a prerequisite of the currently hovered subject
    highlightBlue   : boolean; // Is unlocked by the currently hovered subject
    onMouseEnter    : ( id: string ) => void;
    onMouseLeave    : () => void;
}

// ─── Approved node (compact) ─────────────────────────────────────────────────

function ApprovedNode( { subject }: { subject: Subject } ): React.JSX.Element {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2 opacity-60">
            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />

            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-foreground line-clamp-1 leading-tight">
                    { subject.name }
                </p>

                <p className="text-[9px] text-muted-foreground mt-0.5">
                    { subject.credits } cr. · { subject.professor }
                </p>
            </div>

            <Check className="size-3 text-emerald-500 shrink-0" />
        </div>
    );
}

// ─── Pending node (compact, highlighted border) ───────────────────────────────

function PendingNode( { subject }: { subject: Subject } ): React.JSX.Element {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/5 px-3 py-2">
            <Clock className="size-3.5 text-yellow-500 shrink-0" />

            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-foreground/70 line-clamp-1 leading-tight">
                    { subject.name }
                </p>

                <p className="text-[9px] text-muted-foreground mt-0.5">
                    { subject.credits } cr. · pendiente
                </p>
            </div>
        </div>
    );
}

// ─── Available node (interactive, with inline sections) ───────────────────────

function AvailableNode( { subject }: { subject: Subject } ): React.JSX.Element {
    const hasSections = ( subject.sections?.length ?? 0 ) > 0;

    return (
        <div className="rounded-lg border border-primary/30 bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-150">
            {/* Header */}
            <div className="px-3 pt-2.5 pb-2 border-b border-border/40">
                <div className="flex items-start justify-between gap-1 mb-1">
                    <p className="text-[11px] font-bold text-foreground leading-snug line-clamp-2">
                        { subject.name }
                    </p>

                    <Badge
                        variant="outline"
                        className={ [
                            'shrink-0 text-[8px] h-3.5 px-1 border',
                            subject.isRequired
                                ? 'border-blue-400/40 text-blue-600 dark:text-blue-400'
                                : 'border-violet-400/40 text-violet-600 dark:text-violet-400',
                        ].join( ' ' ) }
                    >
                        { subject.isRequired ? 'Obligatorio' : 'Electivo' }
                    </Badge>
                </div>

                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                    <span>{ subject.credits } cr.</span>
                    <span>·</span>
                    <span className="capitalize">{ subject.kind }</span>
                </div>
            </div>

            {/* Sections */}
            <div className="px-2 py-2 space-y-1">
                { hasSections ? (
                    subject.sections!.map( ( section ) => (
                        <SectionPill
                            key={ section.id }
                            section={ section }
                            subject={ subject }
                        />
                    ) )
                ) : (
                    // Fallback: single-section pill built from the subject itself
                    <SectionPill
                        section={ {
                            id        : `${ subject.id }-sec-1`,
                            label     : 'Sec 1',
                            professor : subject.professor,
                            schedule  : subject.schedule,
                            quotas    : subject.quotas,
                            capacity  : 45,
                        } }
                        subject={ subject }
                    />
                ) }
            </div>
        </div>
    );
}

// ─── Main Node ────────────────────────────────────────────────────────────────

function PlanEstudiosNodeInner(
    { subject, highlightYellow, highlightBlue, onMouseEnter, onMouseLeave }: PlanEstudiosNodeProps
): React.JSX.Element {
    const status = subject.academicStatus;

    // Highlight ring based on prerequisite relationship
    const ringClass = highlightYellow
        ? 'ring-2 ring-yellow-400 rounded-lg'
        : highlightBlue
            ? 'ring-2 ring-blue-400 rounded-lg'
            : '';

    return (
        <div
            className={ ringClass }
            onMouseEnter={ () => onMouseEnter( subject.id ) }
            onMouseLeave={ onMouseLeave }
        >
            { status === 'approved' ? (
                <ApprovedNode subject={ subject } />
            ) : status === 'failed_or_pending' ? (
                <PendingNode subject={ subject } />
            ) : (
                <AvailableNode subject={ subject } />
            ) }
        </div>
    );
}

export const PlanEstudiosNode = memo( PlanEstudiosNodeInner );
