'use client';

import React, { JSX, memo, useMemo } from 'react';

import { Check, CheckCircle2, Clock } from 'lucide-react';

import { Badge }                        from '@/components/ui/badge';
import { useCart }                      from '@/context/cart-context';
import { useFilters }                   from '@/context/filters-context';
import { useExecutionMode }             from '@/hooks/use-execution-mode';
import { useSubjectQuotas }             from '@/hooks/use-subject-quotas';
import type { SubjectQuotasData }       from '@/hooks/use-subject-quotas';
import { usePeriods }                   from '@/hooks/use-periods';
import type { Period }                  from '@/types/periods';
import type { Subject, SubjectSection } from '@/types/siira';
import { SectionPill }                  from './section-pill';

// Constante para controlar si el estado CREDITED (homologado) se puede volver a seleccionar
const ALLOW_SELECT_CREDITED = false;

// ─── Props ────────────────────────────────────────────────────────────────────
interface PlanEstudiosNodeProps {
    subject         : Subject;
    highlightYellow : boolean; // Is a prerequisite of the currently hovered subject
    highlightBlue   : boolean; // Is unlocked by the currently hovered subject
    onMouseEnter    : ( subject: Subject, section: SubjectSection, e: React.MouseEvent ) => void;
    onMouseLeave    : () => void;
}

// ─── Approved node (compact) ─────────────────────────────────────────────────
function ApprovedNode( { subject }: { subject: Subject } ): JSX.Element {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500 bg-emerald-500/5 px-3 py-2 opacity-80">
            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />

            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-foreground line-clamp-1 leading-tight">
                    { subject.name }
                </p>

                <p className="text-[9px] text-muted-foreground mt-0.5">
                    { subject.credits } créditos · { subject.professor }
                </p>
            </div>

            <Check className="size-3 text-emerald-500 shrink-0" />
        </div>
    );
}

// ─── In Progress node (compact, amber border) ───────────────────────────────
function InProgressNode( { subject }: { subject: Subject } ): JSX.Element {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500 bg-amber-500/5 px-3 py-2">
            <Clock className="size-3.5 text-amber-500 shrink-0" />

            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-foreground/75 line-clamp-1 leading-tight">
                    { subject.name }
                </p>

                <p className="text-[9px] text-muted-foreground mt-0.5">
                    { subject.credits } créditos · cursando
                </p>
            </div>
        </div>
    );
}

// ─── Credited node (compact, purple border) ──────────────────────────────────
function CreditedNode( { subject }: { subject: Subject } ): JSX.Element {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-purple-500 bg-purple-500/5 px-3 py-2 opacity-80">
            <CheckCircle2 className="size-3.5 text-purple-500 shrink-0" />

            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-foreground line-clamp-1 leading-tight">
                    { subject.name }
                </p>

                <p className="text-[9px] text-muted-foreground mt-0.5">
                    { subject.credits } créditos · homologado
                </p>
            </div>
        </div>
    );
}

// ─── Available node (interactive, with inline sections) ───────────────────────
interface AvailableNodeProps {
    subject         : Subject;
    liveQuotas?     : SubjectQuotasData;
    className?      : string;
    onMouseEnter    : ( subject: Subject, section: SubjectSection, e: React.MouseEvent ) => void;
    onMouseLeave    : () => void;
    isPeriodActive  : boolean;
}

function AvailableNode( {
    subject,
    liveQuotas,
    className,
    onMouseEnter,
    onMouseLeave,
    isPeriodActive
}: AvailableNodeProps ): JSX.Element {
    const {
        hideNoQuotas,
        selectedSessionTypes,
        selectedDays,
        selectedBuildings,
        selectedSpaceTypes,
    } = useFilters();
    const { draftSubjects } = useCart();

    const currentInCart = draftSubjects.find( ( s ) => s.id === subject.id );
    const hasSections   = ( subject.sections?.length ?? 0 ) > 0;

    const visibleSections = useMemo( () => {
        if ( !subject.sections ) return [];

        return subject.sections.filter( ( section ) => {
            // Check advanced filters
            if ( selectedSessionTypes.length > 0 && !selectedSessionTypes.includes( section.sessionName ) ) {
                return false;
            }
            if ( selectedDays.length > 0 && !selectedDays.includes( section.day ) ) {
                return false;
            }
            if ( selectedBuildings.length > 0 && ( !section.building || !selectedBuildings.includes( section.building ) ) ) {
                return false;
            }
            if ( selectedSpaceTypes.length > 0 && ( !section.spaceType || !selectedSpaceTypes.includes( section.spaceType ) ) ) {
                return false;
            }

            // Check quota filter
            if ( hideNoQuotas ) {
                const isThisSection = currentInCart?.professor === section.professor;
                if ( isThisSection ) return true;

                const liveSec       = liveQuotas?.sections.find( ( s ) => s.id === section.id );
                const currentQuotas = liveSec ? liveSec.quotas : section.quotas;
                return currentQuotas > 0;
            }

            return true;
        } );
    }, [
        subject.sections,
        hideNoQuotas,
        liveQuotas,
        currentInCart,
        selectedSessionTypes,
        selectedDays,
        selectedBuildings,
        selectedSpaceTypes,
    ] );

    const borderClass = [
        className ?? "border-primary/30 bg-card hover:border-primary/50 shadow-sm hover:shadow-md",
        !isPeriodActive && "opacity-50 grayscale bg-muted/10 border-muted"
    ].filter( Boolean ).join( ' ' );

    return (
        <div className={ [ "rounded-lg border transition-all duration-150", borderClass ].join( ' ' ) }>
            {/* Header */}
            <div className="px-3 pt-2.5 pb-2 border-b border-border/40 space-y-1">
                {/* <div className="flex items-start justify-between gap-1 mb-1"> */}
                    <p className="text-[11px] font-bold text-foreground leading-snug line-clamp-2">
                        { subject.name }
                    </p>

                    {/* <Badge
                        variant="outline"
                        className={ [
                            'shrink-0 text-[8px] h-3.5 px-1 border',
                            subject.isRequired
                                ? 'border-blue-400/40 text-blue-600 dark:text-blue-400'
                                : 'border-violet-400/40 text-violet-600 dark:text-violet-400',
                        ].join( ' ' ) }
                    >
                        { subject.isRequired ? 'Obligatorio' : 'Electivo' }
                    </Badge> */}
                {/* </div> */}

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{ subject.credits } créditos</span>

                    { !isPeriodActive && (
                        <span className="text-[10px] text-destructive font-semibold bg-destructive/10 px-1 py-0.5 rounded border border-destructive/20 shrink-0">
                            Fuera de periodo
                        </span>
                    ) }


                    <Badge
                        variant="outline"
                        className={ [
                            'shrink-0 text-[9px] h-3.5 px-1 border',
                            subject.isRequired
                                ? 'border-blue-400/40 text-blue-600 dark:text-blue-400'
                                : 'border-violet-400/40 text-violet-600 dark:text-violet-400',
                        ].join( ' ' ) }
                    >
                        { subject.isRequired ? 'Obligatorio' : 'Electivo' }
                    </Badge>
                </div>
            </div>

            {/* Sections */}
            <div className="px-2 py-2 space-y-1">
                { hasSections ? (
                    visibleSections.map( ( section ) => {
                        const liveSec       = liveQuotas?.sections.find( ( s ) => s.id === section.id );
                        const currentQuotas = liveSec ? liveSec.quotas : section.quotas;
                        return (
                            <SectionPill
                                key             = { section.id }
                                section         = { section }
                                subject         = { subject }
                                currentQuotas   = { currentQuotas }
                                onMouseEnter    = { onMouseEnter }
                                onMouseLeave    = { onMouseLeave }
                            />
                        );
                    } )
                ) : (
                    // Fallback: single-section pill built from the subject itself
                    ( () => {
                        const currentQuotas = liveQuotas ? liveQuotas.quotas : subject.quotas;
                        return (
                            <SectionPill
                                section         = { {
                                    id			: `${ subject.id }-sec-1`,
                                    label		: 'Sec 1',
                                    professor	: subject.professor,
                                    schedule	: subject.schedule,
                                    quotas		: subject.quotas,
                                    capacity	: 45,
                                    ssec        : `${ subject.id }-1`,
                                    sessionName : 'Asignatura',
                                    building    : null,
                                    spaceType   : null,
                                    spaceId     : null,
                                    isEnglish   : false,
                                    profEmail   : null,
                                    day         : 'Lunes',
                                    timeLabel   : '08:15 - 09:25',
                                } }
                                subject         = { subject }
                                currentQuotas   = { currentQuotas }
                                onMouseEnter    = { onMouseEnter }
                                onMouseLeave    = { onMouseLeave }
                            />
                        );
                    } )()
                ) }
            </div>
        </div>
    );
}

// ─── Main Node ────────────────────────────────────────────────────────────────
function PlanEstudiosNodeInner({
    subject,
    highlightYellow,
    highlightBlue,
    onMouseEnter,
    onMouseLeave
}: PlanEstudiosNodeProps ): JSX.Element | null {
    const historyStatus     = subject.academicHistory?.status ?? null;
    const { hideNoQuotas }  = useFilters();
    const { mode }          = useExecutionMode();
    const { draftSubjects } = useCart();
    const { data: periods } = usePeriods();

    // Determine active periods (now is between startDate and endDate)
    const activePeriodIds = useMemo( () => {
        if ( !periods ) return new Set<string>();

        const now = new Date();

        return new Set(
            periods
            .filter( ( p: Period ) => {
                const start = new Date( p.startDate );
                const end   = new Date( p.endDate );

                return now >= start && now <= end;
            })
            .map( ( p: Period ) => p.id )
        );
    }, [ periods ] );


    const isPeriodActive = useMemo( () => {
        if ( !periods ) return true; // Default to true while loading
        if ( !subject.rawSections || subject.rawSections.length === 0 ) return true;

        return subject.rawSections.some( ( sec ) => activePeriodIds.has( sec.periodId ) );
    }, [ subject.rawSections, activePeriodIds, periods ] );


    const isAvailableToEnroll = historyStatus === null || historyStatus === 'FAILED' || ( historyStatus === 'CREDITED' && ALLOW_SELECT_CREDITED );


    const { data: liveQuotas } = useSubjectQuotas(
        subject.id,
        mode === 'toma_ramos' && isAvailableToEnroll && isPeriodActive
    );

    // If hideNoQuotas filter is enabled, check if all sections (or the subject itself) have 0 quotas
    if ( isAvailableToEnroll && hideNoQuotas ) {
        const currentInCart = draftSubjects.find( ( s ) => s.id === subject.id );
        // Only hide if not selected in the cart
        if ( !currentInCart ) {
            const hasSections = ( subject.sections?.length ?? 0 ) > 0;

            if ( hasSections ) {
                const allFull = subject.sections!.every( ( section ) => {
                    const liveSec       = liveQuotas?.sections.find( ( s ) => s.id === section.id );
                    const currentQuotas = liveSec ? liveSec.quotas : section.quotas;

                    return currentQuotas === 0;
                });

                if ( allFull ) return null;
            } else {
                const currentQuotas = liveQuotas ? liveQuotas.quotas : subject.quotas;

                if ( currentQuotas === 0 ) return null;
            }
        }
    }

    // Highlight ring based on prerequisite relationship
    const ringClass = highlightYellow
        ? 'ring-2 ring-yellow-400 rounded-lg'
        : highlightBlue
            ? 'ring-2 ring-blue-400 rounded-lg'
            : '';

    return (
        <div className={ ringClass }>
            { historyStatus === 'APPROVED' ? (
                <ApprovedNode subject = { subject } />
            ) : historyStatus === 'IN_PROGRESS' ? (
                <InProgressNode subject = { subject } />
            ) : historyStatus === 'CREDITED' && !ALLOW_SELECT_CREDITED ? (
                <CreditedNode subject = { subject } />
            ) : historyStatus === 'CREDITED' && ALLOW_SELECT_CREDITED ? (
                <AvailableNode
                    subject        = { subject }
                    liveQuotas     = { liveQuotas }
                    className      = "border-purple-500 bg-purple-500/5 hover:border-purple-600 shadow-sm hover:shadow-md"
                    onMouseEnter   = { onMouseEnter }
                    onMouseLeave   = { onMouseLeave }
                    isPeriodActive = { isPeriodActive }
                />
            ) : historyStatus === 'FAILED' ? (
                <AvailableNode
                    subject        = { subject }
                    liveQuotas     = { liveQuotas }
                    className      = "border-red-500 bg-red-500/5 hover:border-red-600 shadow-sm hover:shadow-md"
                    onMouseEnter   = { onMouseEnter }
                    onMouseLeave   = { onMouseLeave }
                    isPeriodActive = { isPeriodActive }
                />
            ) : (
                <AvailableNode
                    subject        = { subject }
                    liveQuotas     = { liveQuotas }
                    onMouseEnter   = { onMouseEnter }
                    onMouseLeave   = { onMouseLeave }
                    isPeriodActive = { isPeriodActive }
                />
            )}
        </div>
    );
}

export const PlanEstudiosNode = memo( PlanEstudiosNodeInner );
