'use client';

import { useMemo, useState } from 'react';

import Fuse from 'fuse.js';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { useCart }    from '@/context/cart-context';
import { useFilters } from '@/context/filters-context';
import { useSubjects }           from '@/hooks/use-subjects';
import type { ScheduleSlot, Subject } from '@/types/siira';
import { HorarioGrid, HorarioGridSkeleton } from '../shared/grid/horario-grid';
import { SubjectCardSkeleton }              from './subject-card-skeleton';
import { VirtualGrid }                      from './virtual-grid';
import { ChevronLeft, ChevronRight, Clock, Filter, ShoppingCart } from 'lucide-react';
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

type CatalogTab = 'horario' | 'catalogo';

export function CatalogoCentral(): React.JSX.Element {
    const [ activeTab, setActiveTab ] = useState<CatalogTab>( 'horario' );

    const { data: subjects, isLoading, isError } = useSubjects();
    const {
        searchQuery,
        showRequired,
        showOptional,
        scheduleBlock,
        hideCollisions,
        hideNoQuotas,
        isSidebarOpen,
        toggleSidebar,
    } = useFilters();
    const { draftSubjects, isCartOpen, toggleCart } = useCart();

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
        draftSubjects,
    ] );

    const requiredSubjects = useMemo(
        () => filtered.filter( ( s ) => s.isRequired ),
        [ filtered ]
    );

    const electiveSubjects = useMemo(
        () => filtered.filter( ( s ) => !s.isRequired ),
        [ filtered ]
    );

    // ── Loading ────────────────────────────────────────────────────────────────
    if ( isLoading ) {
        return (
            <div className="flex-1 overflow-hidden flex flex-col">
                <TabHeader activeTab={ activeTab } onTabChange={ setActiveTab } />

                { activeTab === 'horario' ? (
                    <HorarioGridSkeleton />
                ) : (
                    <div className="flex-1 overflow-hidden px-4 py-4 space-y-4">
                        <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                        { Array.from( { length: 6 } ).map( ( _, i ) => (
                            <SubjectCardSkeleton key={ i } />
                        ) ) }
                    </div>
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
                <TabHeader activeTab={ activeTab } onTabChange={ setActiveTab } />

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
                                id="tab-horario"
                                value="horario"
                                className="h-7 px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                📅 Horario
                            </TabsTrigger>

                            <TabsTrigger
                                id="tab-catalogo"
                                value="catalogo"
                                className="h-7 px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                ☰ Catálogo
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <Button variant="outline" onClick={ toggleCart }>
                        <ShoppingCart className='size-4' />
                        { isCartOpen ? (
                            <ChevronRight className='size-4' />
                        ) : (
                            <ChevronLeft className='size-4' />
                        ) }
                    </Button>
                </div>

                {/* Horario tab */}
                <TabsContent
                    value="horario"
                    className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col relative"
                >
                    <HorarioGrid mode="catalog" subjects={ filtered } />
                </TabsContent>

                {/* Catálogo tab */}
                <TabsContent
                    value="catalogo"
                    className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col"
                >
                    { searchQuery.trim() ? (
                        <div className="flex-1 overflow-hidden px-4 py-4 h-full">
                            <VirtualGrid subjects={ filtered } />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden px-4 py-4 flex flex-col gap-1 h-full">
                            { requiredSubjects.length > 0 && (
                                <div className="shrink-0">
                                    <div className="flex items-center gap-2 mb-3 sticky top-0 z-10 py-2 bg-background/95 backdrop-blur-sm">
                                        <div className="h-4 w-1 rounded-full bg-blue-500" />
                                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Sugeridos para tu semestre
                                        </h2>
                                        <span className="text-xs text-muted-foreground/60">
                                            ({ requiredSubjects.length })
                                        </span>
                                    </div>
                                </div>
                            ) }

                            { requiredSubjects.length > 0 && (
                                <div className="flex-1 min-h-0 overflow-hidden">
                                    <VirtualGrid subjects={ requiredSubjects } />
                                </div>
                            ) }

                            { electiveSubjects.length > 0 && (
                                <div className="shrink-0 mt-4">
                                    <div className="flex items-center gap-2 mb-3 sticky top-0 z-10 py-2 bg-background/95 backdrop-blur-sm">
                                        <div className="h-4 w-1 rounded-full bg-violet-500" />
                                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Electivos
                                        </h2>
                                        <span className="text-xs text-muted-foreground/60">
                                            ({ electiveSubjects.length })
                                        </span>
                                    </div>
                                </div>
                            ) }

                            { electiveSubjects.length > 0 && (
                                <div className="flex-1 min-h-0 overflow-hidden">
                                    <VirtualGrid subjects={ electiveSubjects } />
                                </div>
                            ) }
                        </div>
                    ) }
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ─── Tab Header (extracted for loading/empty states) ─────────────────────────

interface TabHeaderProps {
    activeTab   : CatalogTab;
    onTabChange : ( tab: CatalogTab ) => void;
}

function TabHeader( { activeTab, onTabChange }: TabHeaderProps ): React.JSX.Element {
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
                    id="tab-catalogo-fallback"
                    onClick={ () => onTabChange( 'catalogo' ) }
                    className={[
                        'h-7 px-3 text-xs rounded-md transition-all',
                        activeTab === 'catalogo'
                            ? 'bg-background shadow-sm text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground',
                    ].join( ' ' )}
                >
                    ☰ Catálogo
                </button>
            </div>
        </div>
    );
}
