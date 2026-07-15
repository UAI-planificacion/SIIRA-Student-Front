'use client';

import { useMemo, useState, useEffect } from 'react';

import Fuse from 'fuse.js';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { useCart }          from '@/context/cart-context';
import { useFilters }       from '@/context/filters-context';
import { useSubjects }      from '@/hooks/use-subjects';
import { useStudent }       from '@/hooks/use-student';
import { useExecutionMode } from '@/hooks/use-execution-mode';
import type { ScheduleSlot, Subject } from '@/types/siira';
import { HorarioGrid, HorarioGridSkeleton } from '../shared/grid/horario-grid';
import { ScheduleGenerator }               from '../generator/schedule-generator';
import { PlanEstudiosView }                from '../plan-estudios/plan-estudios-view';
import { ChevronLeft, ChevronRight, Filter, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

type CatalogTab = 'horario' | 'plan' | 'generar';

export function CatalogoCentral(): React.JSX.Element {
    const { mode } = useExecutionMode();
    const [ activeTab, setActiveTab ] = useState<CatalogTab>( 'horario' );

    // Prevent staying on Generar tab if we enter Toma de Ramos mode
    useEffect( () => {
        if ( mode === 'toma_ramos' && activeTab === 'generar' ) {
            setActiveTab( 'horario' );
        }
    }, [ mode, activeTab ] );

    const { data: subjects, isLoading, isError } = useSubjects();
    const { data: student }                      = useStudent();
    const {
        searchQuery,
        showRequired,
        showOptional,
        scheduleBlock,
        hideCollisions,
        hideNoQuotas,
        hideExceedingCredits,
        isSidebarOpen,
        toggleSidebar,
    } = useFilters();
    const { draftSubjects, usedCredits, isCartOpen, toggleCart } = useCart();

    const fuse = useMemo( () => {
        if ( !subjects ) return null;

        return new Fuse<Subject>( subjects, {
            keys      : [ 'name', 'professor', 'id' ],
            threshold : 0.35,
        } );
    }, [ subjects ] );

    const filtered = useMemo<Subject[]>( () => {
        if ( !subjects ) return [];

        let list: Subject[] = subjects;

        // Fuzzy search
        if ( searchQuery.trim() && fuse ) {
            list = fuse.search( searchQuery ).map( ( r ) => r.item );
        }

        // Filter by type
        list = list.filter( ( s ) => {
            if ( s.isRequired  && !showRequired ) return false;
            if ( !s.isRequired && !showOptional ) return false;

            return true;
        } );

        // Filter by schedule block
        if ( scheduleBlock !== 'all' ) {
            list = list.filter( ( s ) => {
                const slots     = parseSchedule( s.schedule );
                const isMorning = slots.some( ( sl ) => sl.block <= 4 );
                const isAfternoon = slots.some( ( sl ) => sl.block >= 5 );

                if ( scheduleBlock === 'morning' )   return isMorning;
                if ( scheduleBlock === 'afternoon' )  return isAfternoon;

                return true;
            } );
        }

        // Hide no-quota subjects
        if ( hideNoQuotas ) {
            list = list.filter( ( s ) => s.quotas > 0 );
        }

        // Hide schedule collisions with cart
        if ( hideCollisions && draftSubjects.length > 0 ) {
            list = list.filter( ( s ) => {
                const inCart = draftSubjects.some( ( ds ) => ds.id === s.id );

                if ( inCart ) return true;

                return !hasCollision( s, draftSubjects );
            } );
        }

        // Hide subjects exceeding remaining credits
        if ( hideExceedingCredits ) {
            const maxCredits      = student?.totalCredits ?? 30;
            const remainingCredits = maxCredits - usedCredits;
            list = list.filter( ( s ) => s.credits <= remainingCredits );
        }

        return list;
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
    ] );

    // ── Loading ────────────────────────────────────────────────────────────────
    if ( isLoading ) {
        return (
            <div className="flex-1 overflow-hidden flex flex-col">
                <TabHeader activeTab={ activeTab } onTabChange={ setActiveTab } mode={ mode } />

                { activeTab === 'horario' ? (
                    <HorarioGridSkeleton />
                ) : activeTab === 'plan' ? (
                    // PlanEstudiosView handles its own skeleton internally
                    <PlanEstudiosView />
                ) : (
                    // ScheduleGenerator handles its own skeleton internally
                    <ScheduleGenerator />
                ) }
            </div>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────────
    if ( isError ) {
        return (
            <div className="flex-1 flex items-center justify-center text-destructive text-sm">
                Error al cargar las asignaturas. Intente nuevamente.
            </div>
        );
    }

    // ── Empty ──────────────────────────────────────────────────────────────────
    if ( filtered.length === 0 ) {
        return (
            <div className="flex-1 flex flex-col">
                <TabHeader activeTab={ activeTab } onTabChange={ setActiveTab } mode={ mode } />

                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <span className="text-3xl">🔍</span>
                    <p className="text-sm">No se encontraron asignaturas con los filtros actuales.</p>
                </div>
            </div>
        );
    }

    // ── Main render ────────────────────────────────────────────────────────────
    return (
        <div className="flex-1 overflow-hidden flex flex-col relative">
            <Tabs
                value           = { activeTab }
                onValueChange   = { ( v ) => setActiveTab( v as CatalogTab ) }
                className       = "flex flex-col flex-1 overflow-hidden"
            >
                {/* Tab bar */}
                <div className="shrink-0 px-4 py-2 border-b border-border bg-background/95 backdrop-blur-sm flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={ toggleSidebar }>
                            { isSidebarOpen ? (
                                <ChevronLeft className='size-4' />
                            ) : (
                                <ChevronRight className='size-4' />
                            ) }

                            <Filter className="size-4" />

                            <p className="text-[10px] text-foreground">({ filtered.length })</p>
                        </Button>

                        <TabsList className="h-8 gap-1 bg-muted/60 p-0.5">
                            <TabsTrigger
                                id          = "tab-horario"
                                value       = "horario"
                                className   = "h-7 px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                📅 Horario
                            </TabsTrigger>

                            <TabsTrigger
                                id          = "tab-plan"
                                value       = "plan"
                                className   = "h-7 px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                🏛️ Plan
                            </TabsTrigger>

                            { mode !== 'toma_ramos' && (
                                <TabsTrigger
                                    id          = "tab-generar"
                                    value       = "generar"
                                    className   = "h-7 px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                >
                                    ✨ Generar
                                </TabsTrigger>
                            ) }
                        </TabsList>
                    </div>

                    { mode !== 'toma_ramos' && (
                        <Button variant="outline" onClick={ toggleCart }>
                            <ShoppingCart className='size-4' />
                            { isCartOpen ? (
                                <ChevronRight className='size-4' />
                            ) : (
                                <ChevronLeft className='size-4' />
                            )}
                        </Button>
                    ) }
                </div>

                {/* Horario tab */}
                <TabsContent
                    value       = "horario"
                    className   = "flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col relative"
                >
                    <HorarioGrid mode="catalog" subjects={ filtered } />
                </TabsContent>

                {/* Plan de Estudios tab */}
                <TabsContent
                    value       = "plan"
                    className   = "flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col"
                >
                    <PlanEstudiosView />
                </TabsContent>

                {/* Generar tab */}
                { mode !== 'toma_ramos' && (
                    <TabsContent
                        value       = "generar"
                        className   = "flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col"
                    >
                        <ScheduleGenerator />
                    </TabsContent>
                ) }
            </Tabs>
        </div>
    );
}

// ─── Tab Header (extracted for loading/empty states) ─────────────────────────

interface TabHeaderProps {
    activeTab   : CatalogTab;
    onTabChange : ( tab: CatalogTab ) => void;
    mode        : string;
}

function TabHeader( { activeTab, onTabChange, mode }: TabHeaderProps ): React.JSX.Element {
    return (
        <div className="shrink-0 px-4 pt-3 pb-0 border-b border-border bg-background/95">
            <div className="flex gap-1 bg-muted/60 rounded-lg p-0.5 w-fit h-8">
                <button
                    id="tab-horario-fallback"
                    onClick={ () => onTabChange( 'horario' ) }
                    className={[
                        'h-7 px-3 text-xs rounded-md transition-all',
                        activeTab === 'horario'
                            ? 'bg-background shadow-sm text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground',
                    ].join( ' ' )}
                >
                    📅 Horario
                </button>

                <button
                    id="tab-plan-fallback"
                    onClick={ () => onTabChange( 'plan' ) }
                    className={ [
                        'h-7 px-3 text-xs rounded-md transition-all',
                        activeTab === 'plan'
                            ? 'bg-background shadow-sm text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground',
                    ].join( ' ' ) }
                >
                    🏛️ Plan
                </button>

                { mode !== 'toma_ramos' && (
                    <button
                        id="tab-generar-fallback"
                        onClick={ () => onTabChange( 'generar' ) }
                        className={ [
                            'h-7 px-3 text-xs rounded-md transition-all',
                            activeTab === 'generar'
                                ? 'bg-background shadow-sm text-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground',
                        ].join( ' ' ) }
                    >
                        ✨ Generar
                    </button>
                ) }
            </div>
        </div>
    );
}
