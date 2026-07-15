'use client';

import { memo, useState } from 'react';

import { Check, ShoppingCart, AlertCircle } from 'lucide-react';

import { useCart }              from '@/context/cart-context';
import { useExecutionMode }     from '@/hooks/use-execution-mode';
import type { Subject, SubjectSection } from '@/types/siira';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button }               from '@/components/ui/button';

// ─── Quota dots helper ────────────────────────────────────────────────────────

function QuotaDots( { quotas, capacity }: { quotas: number; capacity: number } ): React.JSX.Element {
    const DOTS    = 5;
    const filled  = Math.round( ( quotas / Math.max( capacity, 1 ) ) * DOTS );
    const isEmpty = quotas === 0;

    return (
        <span className="flex items-center gap-0.5">
            { Array.from( { length: DOTS } ).map( ( _, i ) => (
                <span
                    key={ i }
                    className={ [
                        'size-1.5 rounded-full',
                        isEmpty
                            ? 'bg-destructive/60'
                            : i < filled
                                ? 'bg-emerald-500'
                                : 'bg-muted',
                    ].join( ' ' ) }
                />
            ) ) }
        </span>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SectionPillProps {
    section : SubjectSection;
    subject : Subject;
}

// ─── Component ────────────────────────────────────────────────────────────────

function SectionPillInner( { section, subject }: SectionPillProps ): React.JSX.Element {
    const { addSubject, removeSubject, draftSubjects } = useCart();
    const { mode } = useExecutionMode();
    const [ confirmOpen, setConfirmOpen ] = useState( false );

    const currentInCart = draftSubjects.find( ( s ) => s.id === subject.id );
    const isThisSection = currentInCart?.professor === section.professor;
    const isInCart      = !!currentInCart;
    const isFull        = section.quotas === 0;

    // En Toma de Ramos: deshabilitado si ya hay algo en el carro (inscrito) o no hay cupo
    // En Planificación: deshabilitado si no hay cupo y no es la sección seleccionada
    const isDisabled = mode === 'toma_ramos'
        ? ( isInCart || isFull )
        : ( isFull && !isThisSection );

    function handleAction(): void {
        const subjectWithSection: Subject = {
            ...subject,
            professor : section.professor,
            schedule  : section.schedule,
            quotas    : section.quotas,
        };

        if ( mode === 'toma_ramos' ) {
            addSubject( subjectWithSection );
        } else {
            if ( isInCart ) removeSubject( subject.id );
            addSubject( subjectWithSection );
        }
    }

    function handleClick(): void {
        if ( mode === 'toma_ramos' ) {
            // Abre confirmación obligatoria para inscripción irreversible
            setConfirmOpen( true );
        } else {
            // Planificación libre (agregar o remover)
            if ( isThisSection ) {
                removeSubject( subject.id );
            } else {
                handleAction();
            }
        }
    }

    return (
        <>
            <button
                id={ `section-pill-${ section.id }` }
                type="button"
                disabled={ isDisabled }
                onClick={ handleClick }
                className={ [
                    'group flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium transition-all duration-150 text-left',
                    isThisSection
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                        : isInCart
                            ? 'bg-muted border-dashed border-border/50 text-muted-foreground'
                            : isFull
                                ? 'bg-destructive/5 border-destructive/20 text-muted-foreground cursor-not-allowed opacity-60'
                                : 'bg-background border-border hover:border-primary/50 hover:bg-primary/5 hover:text-foreground text-foreground/80',
                    // Evitar estilos de hover si está deshabilitado
                    isDisabled && 'cursor-not-allowed opacity-50',
                ].join( ' ' ) }
                aria-label={ `${ isThisSection ? 'Quitar' : 'Añadir' } ${ section.label } — ${ section.professor }` }
            >
                { isThisSection ? (
                    <Check className="size-2.5 text-emerald-500 shrink-0" />
                ) : (
                    <ShoppingCart className="size-2.5 shrink-0 opacity-50 group-hover:opacity-100" />
                ) }

                <span>
                    <span className="font-semibold">{ section.label }</span>
                    { ' · ' }
                    { section.professor }
                </span>

                <QuotaDots quotas={ section.quotas } capacity={ section.capacity } />

                <span className={ [
                    'ml-auto tabular-nums',
                    section.quotas === 0
                        ? 'text-destructive'
                        : section.quotas < 10
                            ? 'text-orange-500'
                            : 'text-muted-foreground',
                ].join( ' ' ) }>
                    { section.capacity }
                </span>
            </button>

            {/* Dialog de confirmación de inscripción formal (Modo Toma de Ramos) */}
            <Dialog open={ confirmOpen } onOpenChange={ ( open ) => { if ( !open ) { /* prevent close externally by not doing setConfirmOpen(false) here */ } } }>
                <DialogContent showCloseButton={ false }>
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive mb-1">
                            <AlertCircle className="size-5 shrink-0" />
                            <DialogTitle className="text-base font-bold text-foreground">
                                Confirmar Inscripción de Asignatura
                            </DialogTitle>
                        </div>

                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            ¿Estás seguro de que deseas inscribir la asignatura <strong className="text-foreground">{ subject.name }</strong> en la <strong className="text-foreground">{ section.label }</strong> dictada por el profesor <strong className="text-foreground">{ section.professor }</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-2 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-[11px] text-yellow-600 dark:text-yellow-400 leading-normal">
                        ⚠ <strong>Importante:</strong> Esta acción es de registro automático. Una vez confirmada, no podrás revertirla ni modificar la sección desde esta plataforma; deberás gestionarlo formalmente con la secretaría académica de la universidad.
                    </div>

                    <DialogFooter className="flex gap-2 justify-end">
                        <Button
                            id="dialog-confirm-cancel"
                            variant="outline"
                            onClick={ () => setConfirmOpen( false ) }
                            className="h-8 text-xs font-semibold"
                        >
                            Cancelar
                        </Button>

                        <Button
                            id="dialog-confirm-accept"
                            onClick={ () => {
                                setConfirmOpen( false );
                                handleAction();
                            } }
                            className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Aceptar e Inscribir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export const SectionPill = memo( SectionPillInner );
