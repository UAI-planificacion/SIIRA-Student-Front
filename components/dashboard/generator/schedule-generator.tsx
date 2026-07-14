'use client';

import { useCallback, useState } from 'react';

import { Sparkles, Wand2 } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
}                                   from '@/components/ui/dialog';

import {
    generateProposals,
    type SchedulePreferences,
    type ScheduleProposal,
}                                   from '@/lib/schedule-generator';
import { SchedulePreferencesForm }  from './schedule-preferences-form';
import { ProposalCard }             from './proposal-card';
import { ProposalGridPreview }      from './proposal-grid-preview';
import { Button }                   from '@/components/ui/button';
import { useSubjects }              from '@/hooks/use-subjects';
import { useCart }                  from '@/context/cart-context';
import type { Subject }             from '@/types/siira';

// ─── Default preferences ─────────────────────────────────────────────────────
const DEFAULT_PREFERENCES: SchedulePreferences = {
    timePreference : 'any',
    distribution   : 'spread',
    freeDays       : [],
};

// ─── Proposal skeleton ────────────────────────────────────────────────────────
function ProposalsSkeleton(): React.JSX.Element {
    return (
        <div className="flex gap-4">
            { [ 0, 1, 2 ].map( ( i ) => (
                <div
                    key={ i }
                    className="flex-1 min-w-[220px] rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse"
                >
                    <div className="space-y-2">
                        <div className="h-6 w-8 bg-muted rounded" />
                        <div className="h-4 w-3/4 bg-muted rounded" />
                        <div className="h-3 w-full bg-muted/60 rounded" />
                    </div>

                    <div className="h-3 w-24 bg-muted/60 rounded" />

                    <div className="space-y-1.5">
                        { [ 0, 1, 2, 3 ].map( ( j ) => (
                            <div key={ j } className="h-3 bg-muted/40 rounded w-full" style={ { opacity: 1 - j * 0.15 } } />
                        ) ) }
                    </div>

                    <div className="h-8 w-full bg-muted/60 rounded-lg mt-auto" />
                </div>
            ) ) }
        </div>
    );
}

// ─── Grid skeleton ────────────────────────────────────────────────────────────
function GridSkeleton(): React.JSX.Element {
    return (
        <div className="animate-pulse rounded-xl border border-border bg-card p-3 space-y-1.5">
            <div className="flex gap-1">
                <div className="w-8 h-5 bg-muted/40 rounded" />
                { [ 0, 1, 2, 3, 4, 5 ].map( ( i ) => (
                    <div key={ i } className="flex-1 h-5 bg-muted/60 rounded" />
                ) ) }
            </div>

            { [ 0, 1, 2, 3, 4, 5, 6, 7 ].map( ( i ) => (
                <div key={ i } className="flex gap-1">
                    <div className="w-8 h-8 bg-muted/40 rounded" />
                    { [ 0, 1, 2, 3, 4, 5 ].map( ( j ) => (
                        <div
                            key={ j }
                            className="flex-1 h-8 bg-muted/20 rounded"
                            style={ { opacity: ( i + j ) % 3 === 0 ? 0.6 : 0.2 } }
                        />
                    ) ) }
                </div>
            ) ) }
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState( { onGenerate }: { onGenerate: () => void } ): React.JSX.Element {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-12">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Wand2 className="size-8 text-primary" />
            </div>

            <div>
                <h3 className="text-base font-semibold text-foreground">
                    Configura tus preferencias y genera tu horario ideal
                </h3>

                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    El motor analizará todos los ramos disponibles y te propondrá
                    3 combinaciones sin conflictos adaptadas a tu estilo de vida.
                </p>
            </div>

            <Button
                id="btn-generate-empty"
                onClick={ onGenerate }
                className="gap-2 font-semibold"
            >
                <Sparkles className="size-4" />
                Generar Propuestas
            </Button>
        </div>
    );
}

// ─── Confirmation Dialog ──────────────────────────────────────────────────────
interface ConfirmDialogProps {
    open        : boolean;
    onClose     : () => void;
    onReplace   : () => void;
    onMerge     : () => void;
}

function ConfirmDialog( { open, onClose, onReplace, onMerge }: ConfirmDialogProps ): React.JSX.Element {
    return (
        <Dialog open={ open } onOpenChange={ ( _, o ) => { if ( !o ) onClose(); } }>
            <DialogContent showCloseButton>
                <DialogHeader>
                    <DialogTitle>¿Qué deseas hacer con tu borrador actual?</DialogTitle>

                    <DialogDescription>
                        Ya tienes ramos añadidos al borrador. Puedes reemplazarlos con la
                        propuesta seleccionada o fusionarlos añadiendo solo los nuevos ramos
                        que no generen conflictos.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        id="dialog-btn-merge"
                        variant="outline"
                        onClick={ onMerge }
                    >
                        Fusionar / Agregar
                    </Button>

                    <Button
                        id="dialog-btn-replace"
                        variant="destructive"
                        onClick={ onReplace }
                    >
                        Reemplazar Todo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ScheduleGenerator(): React.JSX.Element {
    const { data: subjects, isLoading: subjectsLoading } = useSubjects();
    const { draftSubjects, addSubject, removeSubject }   = useCart();

    const [ preferences,    setPreferences   ] = useState<SchedulePreferences>( DEFAULT_PREFERENCES );
    const [ proposals,      setProposals     ] = useState<ScheduleProposal[]>( [] );
    const [ isGenerating,   setIsGenerating  ] = useState<boolean>( false );
    const [ activeProposal, setActiveProposal ] = useState<ScheduleProposal | null>( null );
    const [ applyTarget,    setApplyTarget   ] = useState<ScheduleProposal | null>( null );

    // ── Generate ──────────────────────────────────────────────────────────────
    const handleGenerate = useCallback( async () => {
        if ( !subjects || isGenerating ) return;

        setIsGenerating( true );
        setActiveProposal( null );

        // Intentional 1-second UX delay
        await new Promise<void>( ( resolve ) => setTimeout( resolve, 1000 ) );

        const result = generateProposals( subjects, preferences );

        setProposals( result );
        setActiveProposal( result[ 0 ] ?? null );
        setIsGenerating( false );
    }, [ subjects, preferences, isGenerating ] );

    // ── Apply logic ───────────────────────────────────────────────────────────
    function handleApplyRequest( proposal: ScheduleProposal ): void {
        if ( draftSubjects.length > 0 ) {
            setApplyTarget( proposal );
        } else {
            applyDirectly( proposal );
        }
    }

    function applyDirectly( proposal: ScheduleProposal ): void {
        proposal.subjects.forEach( ( s ) => {
            if ( !draftSubjects.some( ( ds ) => ds.id === s.id ) ) {
                addSubject( s );
            }
        } );
    }

    function handleReplace(): void {
        if ( !applyTarget ) return;

        // Remove all current draft subjects
        draftSubjects.forEach( ( s ) => removeSubject( s.id ) );
        // Add proposal subjects
        applyTarget.subjects.forEach( ( s ) => addSubject( s ) );

        setApplyTarget( null );
    }

    function handleMerge(): void {
        if ( !applyTarget ) return;

        // Track occupied slots from current draft
        const occupiedKeys = new Set<string>();

        draftSubjects.forEach( ( ds ) => {
            try {
                ( JSON.parse( ds.schedule ) as Array<{ day: string; block: number }> ).forEach( ( slot ) => {
                    occupiedKeys.add( `${ slot.day }-${ slot.block }` );
                } );
            } catch { /* noop */ }
        } );

        // Add only subjects that don't conflict
        applyTarget.subjects.forEach( ( s ) => {
            if ( draftSubjects.some( ( ds ) => ds.id === s.id ) ) return;

            let conflicts = false;

            try {
                ( JSON.parse( s.schedule ) as Array<{ day: string; block: number }> ).forEach( ( slot ) => {
                    if ( occupiedKeys.has( `${ slot.day }-${ slot.block }` ) ) conflicts = true;
                } );
            } catch { /* noop */ }

            if ( !conflicts ) addSubject( s );
        } );

        setApplyTarget( null );
    }

    // ── Check if a proposal is fully applied ──────────────────────────────────
    function isProposalApplied( proposal: ScheduleProposal ): boolean {
        return proposal.subjects.every( ( s ) => draftSubjects.some( ( ds ) => ds.id === s.id ) );
    }

    // ── Preview subjects (active proposal or first) ───────────────────────────
    const previewSubjects: Subject[] = activeProposal?.subjects ?? proposals[ 0 ]?.subjects ?? [];

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            {/* Preferences form */}
            <SchedulePreferencesForm
                preferences={ preferences }
                isGenerating={ isGenerating || subjectsLoading }
                onChange={ setPreferences }
                onGenerate={ handleGenerate }
            />

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                { isGenerating ? (
                    <>
                        <ProposalsSkeleton />
                        <GridSkeleton />
                    </>
                ) : proposals.length === 0 ? (
                    <EmptyState onGenerate={ handleGenerate } />
                ) : (
                    <>
                        {/* 3 proposal cards */}
                        <div className="flex gap-4 overflow-x-auto pb-1">
                            { proposals.map( ( proposal, i ) => (
                                <ProposalCard
                                    key={ proposal.id }
                                    index={ i }
                                    proposal={ proposal }
                                    isActive={ activeProposal?.id === proposal.id }
                                    isAlreadyApplied={ isProposalApplied( proposal ) }
                                    onActivate={ () => setActiveProposal( proposal ) }
                                    onDeactivate={ () => {} }
                                    onApply={ () => handleApplyRequest( proposal ) }
                                />
                            ) ) }
                        </div>

                        {/* Shared calendar preview */}
                        <div className="rounded-xl border border-border bg-card p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-foreground">
                                    Vista previa del horario
                                </span>

                                { activeProposal && (
                                    <span className="text-[10px] text-muted-foreground">
                                        — { activeProposal.emoji } { activeProposal.label }
                                    </span>
                                ) }
                            </div>

                            <ProposalGridPreview subjects={ previewSubjects } />
                        </div>
                    </>
                ) }
            </div>

            {/* Confirmation dialog */}
            <ConfirmDialog
                open={ applyTarget !== null }
                onClose={ () => setApplyTarget( null ) }
                onReplace={ handleReplace }
                onMerge={ handleMerge }
            />
        </div>
    );
}
