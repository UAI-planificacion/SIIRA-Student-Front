'use client';

import { JSX, memo, useState, useMemo, type MouseEvent } from 'react';

import { Check, AlertCircle, BookMarked } from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
}                                       from '@/components/ui/dialog';
import {
    useSubscribeStudent,
    useUnsubscribeStudent
}                                       from '@/hooks/use-study-plan-mutations';
import { Button }                       from '@/components/ui/button';
import { useCart }                      from '@/context/cart-context';
import { useExecutionMode }             from '@/hooks/use-execution-mode';
import { authClient }                   from '@/lib/auth-client';
import { usePeriods }                   from '@/hooks/use-periods';
import type { Subject, SubjectSection } from '@/types/siira';

// ─── Quota dots helper ────────────────────────────────────────────────────────
function QuotaDots( { quotas, capacity }: { quotas: number; capacity: number } ): React.JSX.Element {
    const DOTS    = 5;
    const filled  = Math.round( ( quotas / Math.max( capacity, 1 ) ) * DOTS );
    const isEmpty = quotas === 0;

    return (
        <span className="flex items-center gap-0.5">
            { Array.from({ length: DOTS }).map(( _, i ) => (
                <span
                    key={ i }
                    className={ [
                        'size-1.5 rounded-full',
                        isEmpty
                            ? 'bg-destructive/60'
                            : i < filled
                                ? 'bg-emerald-500  animate-pulse'
                                : 'bg-muted  animate-pulse',
                    ].join( ' ' )}
                />
            ))}
        </span>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface SectionPillProps {
    section       : SubjectSection;
    subject       : Subject;
    currentQuotas : number;
    onMouseEnter  : ( subject: Subject, section: SubjectSection, e: MouseEvent ) => void;
    onMouseLeave  : () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
function SectionPillInner({
    section,
    subject,
    currentQuotas,
    onMouseEnter,
    onMouseLeave
}: SectionPillProps ): JSX.Element {
    const {
        addSubject,
        removeSubject,
        draftSubjects
    }                                       = useCart();
    const { mode }                            = useExecutionMode();
    const [ confirmAction, setConfirmAction ] = useState< 'subscribe' | 'unsubscribe' | null >( null );
    const { data: periods }                   = usePeriods();
    const { data: session }                   = authClient.useSession();

    const email         = session?.user?.email;
    const currentInCart = draftSubjects.find( ( s ) => s.id === subject.id );
    const isThisSection = currentInCart?.professor === section.professor;
    const isInCart      = !!currentInCart;
    const isFull        = currentQuotas === 0;

    const subscribeMutation   = useSubscribeStudent();
    const unsubscribeMutation = useUnsubscribeStudent();

    const isPending = subscribeMutation.isPending || unsubscribeMutation.isPending;

    // Find the raw section to read its periodId
    const rawSec = useMemo( () => {
        if ( !subject.rawSections ) return null;

        const secId = section.id.split( '_' )[ 0 ];

        return subject.rawSections.find( ( rs ) => rs.id === secId ) ?? null;
    }, [ subject.rawSections, section.id ] );


    const isPeriodActive = useMemo( () => {
        if ( !periods ) return true; // Default to true while loading
        if ( !rawSec )  return true; // Fallback if raw section info is not present

        const now       = new Date();
        const period    = periods.find( ( p ) => p.id === rawSec.periodId );

        if ( !period ) return false;

        const start = new Date( period.startDate );
        const end   = new Date( period.endDate );

        return now >= start && now <= end;
    }, [ periods, rawSec ] );

    // En Toma de Ramos: deshabilitado si ya hay algo en el carro (inscrito) a menos que sea esta sección (para desinscribir), o no hay cupo (a menos que sea esta sección)
    // En Planificación: deshabilitado si no hay cupo y no es la sección seleccionada o fuera de periodo
    const isDisabled = !isPeriodActive || isPending || ( mode === 'toma_ramos'
        ? ( ( isInCart && !isThisSection ) || ( !isInCart && isFull ) )
        : ( isFull && !isThisSection ) );

    function handleAction(): void {
        const subjectWithSection: Subject = {
            ...subject,
            professor : section.professor,
            schedule  : section.schedule,
            quotas    : currentQuotas,
        };

        if ( mode === 'toma_ramos' ) {
            addSubject( subjectWithSection );
        } else {
            if ( isInCart ) removeSubject( subject.id );
            addSubject( subjectWithSection );
        }
    }

    const handleSubscribe = () => {
        if ( !email ) {
            toast.error( 'Error: No se encontró el correo del estudiante' );
            return;
        }

        const parts     = section.id.split( '_' );
        const sessionId = parts[ 1 ] ?? parts[ 0 ];

        subscribeMutation.mutate({
            sessionId,
            email,
        }, {
            onSuccess: ( data ) => {
                toast.success( `Inscripción encolada. Ticket: ${ data.ticketId }` );
                handleAction();
            },
            onError: ( err ) => {
                toast.error( err.message || 'Error al solicitar la inscripción' );
            }
        });
    };

    const handleUnsubscribe = () => {
        if ( !email ) {
            toast.error( 'Error: No se encontró el correo del estudiante' );
            return;
        }

        const parts     = section.id.split( '_' );
        const sessionId = parts[ 1 ] ?? parts[ 0 ];

        unsubscribeMutation.mutate({
            sessionId,
            email,
        }, {
            onSuccess: ( data ) => {
                toast.success( `Desinscripción encolada. Ticket: ${ data.ticketId }` );
                removeSubject( subject.id );
            },
            onError: ( err ) => {
                toast.error( err.message || 'Error al solicitar la desinscripción' );
            }
        });
    };

    function handleClick(): void {
        if ( mode === 'toma_ramos' ) {
            if ( isThisSection ) {
                setConfirmAction( 'unsubscribe' );
            } else {
                setConfirmAction( 'subscribe' );
            }
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
                id              = { `section-pill-${ section.id }` }
                type            = "button"
                disabled        = { isDisabled }
                onClick         = { handleClick }
                onMouseEnter    = { ( e ) => onMouseEnter( subject, section, e ) }
                onMouseLeave    = { onMouseLeave }
                aria-label      = { `${ isThisSection ? 'Quitar' : 'Añadir' } ${ section.label } — ${ section.professor }` }
                className       = {[
                    'group flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium transition-all duration-150 text-left w-full justify-between',
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
            >
                <div className='flex items-center gap-2'>
                    { isThisSection ? (
                        <Check className="size-2.5 text-emerald-500 shrink-0" />
                    ) : (
                        <BookMarked className="size-3.5 shrink-0 opacity-50 group-hover:opacity-100" />
                    )}

                    <div className='grid'>
                        <span className="font-semibold">{ section.label }</span>
                        <span className='text-[9px] text-muted-foreground'>
                            { section.professor }
                        </span>
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    <QuotaDots quotas={ currentQuotas } capacity={ section.capacity } />

                    <span className={[
                        'ml-auto tabular-nums',
                        currentQuotas === 0
                            ? 'text-destructive'
                            : currentQuotas < 10
                            ? 'text-orange-500'
                            : 'text-muted-foreground',
                    ].join( ' ' )}>
                        {/* Solo en modo toma_ramos se muestra el cupo actual */}
                        { mode === 'toma_ramos' &&
                            <span className={ currentQuotas === 0 ? "" : "animate-pulse"}>{ currentQuotas }/</span>
                        }
                        { section.capacity }
                    </span>
                </div>
            </button>

            {/* Dialog de confirmación de inscripción formal (Modo Toma de Ramos) */}
            <Dialog
                open            = { confirmAction === 'subscribe' }
                onOpenChange    = { ( open ) => { if ( !open ) setConfirmAction( null ); } }
            >
                <DialogContent showCloseButton={ false }>
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <AlertCircle className="size-5 shrink-0" />

                            <DialogTitle className="text-base font-bold text-foreground">
                                Confirmar Inscripción de Asignatura
                            </DialogTitle>
                        </div>

                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            ¿Estás seguro de que deseas inscribir la asignatura <strong className="text-foreground">{ subject.name }</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    {/* Visualización en tiempo real de la sección y sus cupos */}
                    <div className="my-2.5 p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground">
                                { section.label }
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                Prof. { section.professor }
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <QuotaDots quotas={ currentQuotas } capacity={ section.capacity } />
                            <span className={[
                                'text-xs font-bold tabular-nums ml-1',
                                currentQuotas === 0
                                    ? 'text-destructive'
                                    : currentQuotas < 10
                                        ? 'text-orange-500'
                                        : 'text-muted-foreground',
                            ].join( ' ' )}>
                                <span className={ currentQuotas === 0 ? "" : "animate-pulse" }>{ currentQuotas }/</span>
                                { section.capacity }
                            </span>
                        </div>
                    </div>

                    <div className="my-2 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-[11px] text-yellow-600 dark:text-yellow-400 leading-normal">
                        ⚠ <strong>Importante:</strong> Esta acción es de registro automático. Una vez confirmada, se encolará y procesará de manera asíncrona.
                    </div>

                    <DialogFooter className="flex gap-2 justify-end">
                        <Button
                            id="dialog-confirm-cancel"
                            variant="outline"
                            onClick={ () => setConfirmAction( null ) }
                            className="h-8 text-xs font-semibold"
                        >
                            Cancelar
                        </Button>

                        <Button
                            id="dialog-confirm-accept"
                            disabled={ currentQuotas === 0 || subscribeMutation.isPending }
                            onClick={ () => {
                                setConfirmAction( null );
                                handleSubscribe();
                            } }
                            className={[
                                'h-8 text-xs font-semibold text-white transition-all',
                                currentQuotas === 0
                                    ? 'bg-muted border-border cursor-not-allowed opacity-50'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                            ].join( ' ' )}
                        >
                            { subscribeMutation.isPending ? 'Procesando...' : currentQuotas === 0 ? 'Sin cupos disponibles' : 'Aceptar e Inscribir' }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmación de desinscripción (Modo Toma de Ramos) */}
            <Dialog
                open            = { confirmAction === 'unsubscribe' }
                onOpenChange    = { ( open ) => { if ( !open ) setConfirmAction( null ); } }
            >
                <DialogContent showCloseButton={ false }>
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive mb-1">
                            <AlertCircle className="size-5 shrink-0" />

                            <DialogTitle className="text-base font-bold text-foreground">
                                Confirmar Cancelación de Inscripción
                            </DialogTitle>
                        </div>

                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            ¿Estás seguro de que deseas desinscribirte de la asignatura <strong className="text-foreground">{ subject.name }</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-2.5 p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground">
                                { section.label }
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                Prof. { section.professor }
                            </p>
                        </div>
                    </div>

                    <div className="my-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-[11px] text-red-600 dark:text-red-400 leading-normal">
                        ⚠ <strong>Importante:</strong> Esta acción liberará tu cupo en esta sección una vez que el servidor la procese.
                    </div>

                    <DialogFooter className="flex gap-2 justify-end">
                        <Button
                            id="dialog-unsubscribe-cancel"
                            variant="outline"
                            onClick={ () => setConfirmAction( null ) }
                            className="h-8 text-xs font-semibold"
                        >
                            Cancelar
                        </Button>

                        <Button
                            id="dialog-unsubscribe-accept"
                            disabled={ unsubscribeMutation.isPending }
                            onClick={ () => {
                                setConfirmAction( null );
                                handleUnsubscribe();
                            } }
                            className="h-8 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 transition-all"
                        >
                            { unsubscribeMutation.isPending ? 'Procesando...' : 'Aceptar y Desinscribir' }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export const SectionPill = memo( SectionPillInner );
