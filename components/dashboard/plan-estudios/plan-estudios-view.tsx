'use client';

import { JSX, useCallback, useMemo, useRef, useState } from 'react';

import {
    BookOpen,
    CheckCircle2,
    Zap
}           from 'lucide-react';
import Fuse from 'fuse.js';

import type {
    ScheduleSlot,
    Subject,
    SubjectSection
}                           from '@/types/siira';
import { useCart }          from '@/context/cart-context';
import { useFilters }       from '@/context/filters-context';
import { useSubjects }      from '@/hooks/use-subjects';
import { useStudent }       from '@/hooks/use-student';
import { PlanEstudiosNode } from './plan-estudios-node';
import { GridTooltip }      from '../shared/grid/grid-tooltip';

// ─── Helpers (mirrored from catalogo-central) ─────────────────────────────────
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PlanEstudiosSkeleton(): JSX.Element {
    return (
        <div className="flex gap-5 overflow-x-auto p-4 pb-6 min-h-0 h-full">
            { Array.from( { length: 6 } ).map( ( _, col ) => (
                <div key={ col } className="flex flex-col gap-3 shrink-0 w-52">
                    <div className="h-7 rounded-lg bg-muted animate-pulse w-3/4" />

                    { Array.from( { length: 3 } ).map( ( _, row ) => (
                        <div
                            key={ row }
                            className={ [
                                'rounded-lg bg-muted animate-pulse',
                                row === 1 ? 'h-24' : 'h-14',
                            ].join( ' ' ) }
                            style={ { animationDelay: `${ ( col * 3 + row ) * 80 }ms` } }
                        />
                    ) ) }
                </div>
            ) ) }
        </div>
    );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend(): JSX.Element {
    return (
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
            <span className="font-semibold uppercase tracking-wider">Leyenda:</span>

            <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-500" />
                Aprobado
            </span>

            <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm border border-yellow-500/60 bg-yellow-500/10" />
                Pendiente
            </span>

            <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm border border-primary/40 bg-primary/10" />
                Disponible
            </span>

            <span className="flex items-center gap-1.5 ml-4 border-l border-border pl-4">
                <span className="size-3 rounded-sm ring-2 ring-yellow-400" />
                Prerrequisito (hover)
            </span>

            <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm ring-2 ring-blue-400" />
                Desbloquea (hover)
            </span>
        </div>
    );
}

// ─── Semester column ──────────────────────────────────────────────────────────
interface SemesterColumnProps {
    semester     : number;
    subjects     : Subject[];
    hoveredId    : string | null;
    allSubjects  : Subject[];
    onMouseEnter : ( subject: Subject, section: SubjectSection, e: React.MouseEvent ) => void;
    onMouseLeave : () => void;
}

function SemesterColumn(
    { semester, subjects, hoveredId, allSubjects, onMouseEnter, onMouseLeave }: SemesterColumnProps
): JSX.Element {
    // Prerequisite highlight sets derived from hovered subject
    const { prerequisiteIds, unlockedIds } = useMemo( () => {
        if ( !hoveredId ) return { prerequisiteIds: new Set<string>(), unlockedIds: new Set<string>() };

        const hovered = allSubjects.find( ( s ) => s.id === hoveredId );

        // Yellow: direct prerequisites of hovered subject
        const prerequisiteIds = new Set( hovered?.prerequisites ?? [] );

        // Blue: subjects that list hovered subject as a prerequisite
        const unlockedIds = new Set(
            allSubjects
                .filter( ( s ) => s.prerequisites?.includes( hoveredId ) )
                .map( ( s ) => s.id )
        );

        return { prerequisiteIds, unlockedIds };
    }, [ hoveredId, allSubjects ] );

    const approvedCount  = subjects.filter( ( s ) => s.academicStatus === 'approved' ).length;
    const availableCount = subjects.filter( ( s ) => s.academicStatus === 'available_to_enroll' ).length;

    if ( subjects.length === 0 ) return <></>;

    return (
        <div className="flex flex-col gap-2 shrink-0 w-60 border-r border-border pr-5 last:border-r-0 last:pr-0 h-full overflow-hidden">
            {/* Column header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-1">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-foreground">
                        Semestre { semester }
                    </h3>

                    <div className="flex items-center gap-2">
                        { approvedCount > 0 && (
                            <div
                                className="flex items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400"
                                title='Aprobados'
                            >
                                <CheckCircle2 className="size-3.5" />
                                { approvedCount }
                            </div>
                        ) }

                        { availableCount > 0 && (
                            <div
                                className="flex items-center gap-0.5 text-[11px] text-primary"
                                title='Disponibles'
                            >
                                <Zap className="size-3.5" />
                                { availableCount }
                            </div>
                        ) }
                    </div>
                </div>

                <div className="h-px bg-border/60" />
            </div>

            {/* Subject nodes */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
                { subjects.map( ( subject ) => (
                    <PlanEstudiosNode
                        key             = { subject.id }
                        subject         = { subject }
                        highlightYellow = { prerequisiteIds.has( subject.id ) }
                        highlightBlue   = { unlockedIds.has( subject.id ) }
                        onMouseEnter    = { onMouseEnter }
                        onMouseLeave    = { onMouseLeave }
                    />
                ) ) }
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PlanEstudiosView(): JSX.Element {
    const { data: subjects, isLoading } = useSubjects();
    const { data: student }             = useStudent();
    const [ hoveredId, setHoveredId ]   = useState<string | null>( null );

    const [ tooltip, setTooltip ] = useState<{
        subject : Subject;
        section : SubjectSection;
        x       : number;
        y       : number;
        alignX  : 'left' | 'right';
        alignY  : 'top' | 'bottom';
    } | null>( null );
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>( null );

    const {
        searchQuery,
        showRequired,
        showOptional,
        scheduleBlock,
        hideCollisions,
        hideNoQuotas,
        hideExceedingCredits,
        selectedSessionTypes,
        selectedDays,
        selectedBuildings,
        selectedSpaceTypes,
    } = useFilters();

    const { draftSubjects, usedCredits } = useCart();

    const handleNodeMouseEnter = useCallback( ( subject: Subject, section: SubjectSection, e: React.MouseEvent ) => {
        if ( hideTimer.current ) clearTimeout( hideTimer.current );

        setHoveredId( subject.id );

        const rect   = ( e.currentTarget as HTMLElement ).getBoundingClientRect();
        const alignX = rect.left > window.innerWidth / 2 ? 'left' : 'right';
        const alignY = rect.top > window.innerHeight / 2 ? 'bottom' : 'top';
        const xPos   = alignX === 'left' ? rect.left : rect.right;
        const yPos   = rect.top;

        setTooltip({
            subject,
            section,
            x       : xPos,
            y       : yPos,
            alignX,
            alignY,
        });
    }, [] );

    const handleNodeMouseLeave = useCallback( () => {
        setHoveredId( null );
        hideTimer.current = setTimeout( () => {
            setTooltip( null );
        }, 150 );
    }, [] );

    const handleTooltipEnter = useCallback( () => {
        if ( hideTimer.current ) clearTimeout( hideTimer.current );
    }, [] );

    const handleTooltipLeave = useCallback( () => {
        setTooltip( null );
    }, [] );

    // ── Fuse instance for available subjects only ──
    const fuse = useMemo( () => {
        if ( !subjects ) return null;

        const available = subjects.filter( ( s ) => s.academicStatus === 'available_to_enroll' );

        return new Fuse<Subject>( available, {
            keys      : [ 'name', 'professor', 'id' ],
            threshold : 0.35,
        } );
    }, [ subjects ] );

    // ── Filter only available_to_enroll subjects; approved/pending always visible ──
    const filteredSubjects = useMemo<Subject[]>( () => {
        if ( !subjects ) return [];

        const hasActiveFilters = selectedSessionTypes.length > 0
            || selectedDays.length          > 0
            || selectedBuildings.length     > 0
            || selectedSpaceTypes.length    > 0;

        return subjects.filter( ( s ) => {
            // Always show non-available subjects (academic history)
            if ( s.academicStatus !== 'available_to_enroll' ) return true;

            // ── Search filter (only applied to available subjects) ──
            if ( searchQuery.trim() && fuse ) {
                const hits = fuse.search( searchQuery ).map( ( r ) => r.item.id );

                if ( !hits.includes( s.id ) ) return false;
            }

            // ── Type filter ──
            if ( s.isRequired  && !showRequired ) return false;
            if ( !s.isRequired && !showOptional  ) return false;

            // ── Schedule block filter ──
            //    For subjects with multiple sections, pass if ANY section matches
            if ( scheduleBlock !== 'all' ) {
                const slotsToCheck: ScheduleSlot[] = s.sections?.length
                    ? s.sections.flatMap( ( sec ) => parseSchedule( sec.schedule ) )
                    : parseSchedule( s.schedule );

                const hasMorning   = slotsToCheck.some( ( sl ) => sl.block <= 4 );
                const hasAfternoon = slotsToCheck.some( ( sl ) => sl.block >= 5 );

                if ( scheduleBlock === 'morning'   && !hasMorning   ) return false;
                if ( scheduleBlock === 'afternoon' && !hasAfternoon ) return false;
            }

            // ── Advanced filters ──
            if ( hasActiveFilters ) {
                if ( !s.sections || s.sections.length === 0 ) return false;

                const hasMatchingSection = s.sections.some( ( section ) => {
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
                    return true;
                } );

                if ( !hasMatchingSection ) return false;
            }

            // ── Hide no-quota subjects ──
            if ( hideNoQuotas ) {
                // Subject has no quotas if all its sections are full (or the subject itself has 0)
                const allFull = s.sections?.length
                    ? s.sections.every( ( sec ) => sec.quotas === 0 )
                    : s.quotas === 0;

                if ( allFull ) return false;
            }

            // ── Hide collisions ──
            if ( hideCollisions && draftSubjects.length > 0 ) {
                const inCart = draftSubjects.some( ( ds ) => ds.id === s.id );

                if ( !inCart && hasCollision( s, draftSubjects ) ) return false;
            }

            // ── Hide subjects exceeding remaining credits ──
            if ( hideExceedingCredits ) {
                const maxCredits       = student?.totalCredits ?? 30;
                const remainingCredits = maxCredits - usedCredits;
                if ( s.credits > remainingCredits ) return false;
            }

            return true;
        } );
    }, [
        subjects,
        searchQuery,
        fuse,
        showRequired,
        showOptional,
        scheduleBlock,
        hideNoQuotas,
        hideCollisions,
        hideExceedingCredits,
        student,
        usedCredits,
        draftSubjects,
        selectedSessionTypes,
        selectedDays,
        selectedBuildings,
        selectedSpaceTypes,
    ] );

    // ── Group filtered subjects by semester ──
    const bySemester = useMemo( () => {
        const map = new Map<number, Subject[]>();

        filteredSubjects.forEach( ( subj ) => {
            const list = map.get( subj.semester ) ?? [];

            list.push( subj );
            map.set( subj.semester, list );
        } );

        return map;
    }, [ filteredSubjects ] );

    // Always show all semesters so columns don't appear/disappear while filtering
    const allSemesters = useMemo(
        () => {
            if ( !subjects ) return [];

            const semSet = new Set( subjects.map( ( s ) => s.semester ) );

            return Array.from( semSet ).sort( ( a, b ) => a - b );
        },
        [ subjects ]
    );

    if ( isLoading ) return <PlanEstudiosSkeleton />;

    const totalSubjects  = subjects?.length ?? 0;
    const approvedCount  = subjects?.filter( ( s ) => s.academicStatus === 'approved' ).length ?? 0;
    const availableCount = filteredSubjects.filter( ( s ) => s.academicStatus === 'available_to_enroll' ).length;

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            {/* Stats and Legend bar */}
            <div className="shrink-0 px-4 py-2 -mt-1 pb-3 bg-background/80 border-b border-border flex items-center justify-between gap-4 text-[11px] text-muted-foreground flex-wrap">
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                        <BookOpen className="size-3" />
                        { totalSubjects } asignaturas en el plan
                    </span>

                    <span className="text-border">·</span>

                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        { approvedCount } aprobadas
                    </span>

                    <span className="text-border">·</span>

                    <span className="flex items-center gap-1 text-primary">
                        <Zap className="size-3" />
                        { availableCount } disponibles
                    </span>
                </div>

                <Legend />
            </div>

            {/* Scrollable grid */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden custom-horizontal-scrollbar">
                <div className="flex gap-5 p-4 pb-8 h-full min-w-max">
                    { allSemesters.map(( semester ) => (
                        <SemesterColumn
                            key             = { semester }
                            semester        = { semester }
                            subjects        = { bySemester.get( semester ) ?? [] }
                            hoveredId       = { hoveredId }
                            allSubjects     = { subjects ?? [] }
                            onMouseEnter    = { handleNodeMouseEnter }
                            onMouseLeave    = { handleNodeMouseLeave }
                        />
                    ))}
                </div>
            </div>

            { tooltip && (
                <GridTooltip
                    subject      = { tooltip.subject }
                    section      = { tooltip.section }
                    x            = { tooltip.x }
                    y            = { tooltip.y }
                    alignX       = { tooltip.alignX }
                    alignY       = { tooltip.alignY }
                    onMouseEnter = { handleTooltipEnter }
                    onMouseLeave = { handleTooltipLeave }
                    onClose      = { () => setTooltip( null ) }
                />
            ) }
        </div>
    );
}
