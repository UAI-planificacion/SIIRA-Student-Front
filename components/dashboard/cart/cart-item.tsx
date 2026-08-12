'use client';

import { useState }      from 'react';
import { X, BookOpen, AlertCircle } from 'lucide-react';
import { toast }         from 'sonner';

import { Button }        from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
}                        from '@/components/ui/dialog';
import { authClient }    from '@/lib/auth-client';
import { useCart }       from '@/context/cart-context';
import { useExecutionMode } from '@/hooks/use-execution-mode';
import { useUnsubscribeStudent } from '@/hooks/use-study-plan-mutations';
import type { Subject }  from '@/types/siira';

interface CartItemProps {
    subject : Subject;
}

export function CartItem( { subject }: CartItemProps ): React.JSX.Element {
    const { removeSubject, draftStatus }  = useCart();
    const { mode }                        = useExecutionMode();
    const { data: session }               = authClient.useSession();
    const [ confirmOpen, setConfirmOpen ] = useState( false );

    const email                = session?.user?.email;
    const isFrozen             = draftStatus === 'submitted';
    const unsubscribeMutation = useUnsubscribeStudent();

    // Find the sessionId from the subject's selected section
    const enrolledSection = subject.sections?.find( ( sec ) => sec.professor === subject.professor );
    const parts           = enrolledSection?.id.split( '_' );
    const sessionId       = parts ? ( parts[ 1 ] ?? parts[ 0 ] ) : null;

    const handleUnsubscribe = () => {
        if ( !email || !sessionId ) {
            toast.error( 'Error: No se pudo obtener la sesión o el estudiante' );
            return;
        }

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

    const handleRemoveClick = () => {
        if ( mode === 'toma_ramos' ) {
            setConfirmOpen( true );
        } else {
            removeSubject( subject.id );
        }
    };

    return (
        <div className="group flex items-start gap-3 px-4 py-3 border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors duration-100">
            <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="size-3.5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight line-clamp-1">
                    { subject.name }
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    { subject.credits } cr. · { subject.professor }
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    { subject.quotas > 0 ? (
                        <span className="text-emerald-500">{ subject.quotas } cupos</span>
                    ) : (
                        <span className="text-destructive">Sin cupos</span>
                    ) }
                </p>
            </div>

            { !isFrozen && (
                <Button
                    id={ `remove-${ subject.id }` }
                    variant="ghost"
                    size="icon"
                    disabled={ unsubscribeMutation.isPending }
                    onClick={ handleRemoveClick }
                    className="size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label={ `Eliminar ${ subject.name }` }
                >
                    <X className="size-3" />
                </Button>
            ) }

            {/* Dialog de confirmación de desinscripción en el carro */}
            <Dialog open={ confirmOpen } onOpenChange={ ( open ) => { if ( !open ) setConfirmOpen( false ); } }>
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
                                Prof. { subject.professor }
                            </p>
                        </div>
                    </div>

                    <div className="my-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-[11px] text-red-600 dark:text-red-400 leading-normal">
                        ⚠ <strong>Importante:</strong> Esta acción liberará tu cupo en esta sección una vez que el servidor la procese.
                    </div>

                    <DialogFooter className="flex gap-2 justify-end">
                        <Button
                            id="cart-unsubscribe-cancel"
                            variant="outline"
                            onClick={ () => setConfirmOpen( false ) }
                            className="h-8 text-xs font-semibold"
                        >
                            Cancelar
                        </Button>

                        <Button
                            id="cart-unsubscribe-accept"
                            disabled={ unsubscribeMutation.isPending }
                            onClick={ () => {
                                setConfirmOpen( false );
                                handleUnsubscribe();
                            } }
                            className="h-8 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 transition-all"
                        >
                            { unsubscribeMutation.isPending ? 'Procesando...' : 'Aceptar y Desinscribir' }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
