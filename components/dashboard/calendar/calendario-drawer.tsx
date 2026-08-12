'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { useCart }          from '@/context/cart-context';
import { HorarioGrid }      from '../shared/grid/horario-grid';
import { authClient }       from '@/lib/auth-client';
import { cn }               from '@/lib/utils';
import { useExecutionMode } from '@/hooks/use-execution-mode';
import { useUnsubscribeStudent } from '@/hooks/use-study-plan-mutations';
import type { Subject }     from '@/types/siira';

// Cart color palette legend (mirrors the colors in HorarioGrid cart mode)
const CART_COLORS = [
    'bg-blue-500/20   text-blue-700   border-blue-500/40   dark:text-blue-300',
    'bg-violet-500/20 text-violet-700 border-violet-500/40 dark:text-violet-300',
    'bg-emerald-500/20 text-emerald-700 border-emerald-500/40 dark:text-emerald-300',
    'bg-orange-500/20 text-orange-700 border-orange-500/40 dark:text-orange-300',
    'bg-pink-500/20   text-pink-700   border-pink-500/40   dark:text-pink-300',
    'bg-cyan-500/20   text-cyan-700   border-cyan-500/40   dark:text-cyan-300',
    'bg-yellow-500/20 text-yellow-700 border-yellow-500/40 dark:text-yellow-300',
    'bg-rose-500/20   text-rose-700   border-rose-500/40   dark:text-rose-300',
];

interface CalendarioDrawerProps {
    open    : boolean;
    onClose : () => void;
}

export function CalendarioDrawer( { open, onClose }: CalendarioDrawerProps ): React.JSX.Element {
    const { draftSubjects, removeSubject, draftStatus } = useCart();
    const { mode }                                       = useExecutionMode();
    const { data: session }                              = authClient.useSession();
    const [ subjectToRemove, setSubjectToRemove ]       = useState<Subject | null>( null );

    const isFrozen             = draftStatus === 'submitted';
    const email                = session?.user?.email;
    const unsubscribeMutation = useUnsubscribeStudent();

    const handleUnsubscribe = () => {
        if ( !subjectToRemove || !email ) return;

        const enrolledSection = subjectToRemove.sections?.find( ( sec ) => sec.professor === subjectToRemove.professor );
        const parts           = enrolledSection?.id.split( '_' );
        const sessionId       = parts ? ( parts[ 1 ] ?? parts[ 0 ] ) : null;

        if ( !sessionId ) {
            toast.error( 'Error: No se pudo obtener el identificador de la sesión' );
            return;
        }

        unsubscribeMutation.mutate({
            sessionId,
            email,
        }, {
            onSuccess: ( data ) => {
                toast.success( `Desinscripción encolada. Ticket: ${ data.ticketId }` );
                removeSubject( subjectToRemove.id );
                setSubjectToRemove( null );
            },
            onError: ( err ) => {
                toast.error( err.message || 'Error al solicitar la desinscripción' );
            }
        });
    };

    const handleRemoveRequest = ( id: string ) => {
        const subject = draftSubjects.find( ( s ) => s.id === id );
        if ( !subject ) return;

        if ( mode === 'toma_ramos' ) {
            setSubjectToRemove( subject );
        } else {
            removeSubject( id );
        }
    };

    return (
        <>
            <Drawer
                open={ open }
                onOpenChange={ ( v ) => { if ( !v ) onClose(); } }
                swipeDirection="left"
            >
                <DrawerContent className="w-full max-w-4xl h-full rounded-none flex flex-col">
                    <DrawerHeader className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                        <DrawerTitle className="text-base font-bold">
                            🗓️ Horario Completo
                        </DrawerTitle>
                        <DrawerClose
                            id="close-calendar-btn"
                            className={cn(
                                buttonVariants({ variant: 'ghost', size: 'icon' }),
                                'size-8'
                            )}
                        >
                            <X className="size-4" />
                        </DrawerClose>
                    </DrawerHeader>

                    {/* Grid */}
                    <div className="flex-1 overflow-hidden">
                        { draftSubjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                                <span className="text-4xl">📅</span>
                                <p className="text-sm">Añade ramos al borrador para visualizar tu horario.</p>
                            </div>
                        ) : (
                            <HorarioGrid
                                mode="cart"
                                subjects={ draftSubjects }
                                onRemove={ handleRemoveRequest }
                                isFrozen={ isFrozen }
                            />
                        ) }
                    </div>

                    {/* Color legend */}
                    { draftSubjects.length > 0 && (
                        <div className="shrink-0 px-4 py-3 border-t border-border flex flex-wrap gap-2">
                            { draftSubjects.map( ( subject, idx ) => (
                                <span
                                    key={ subject.id }
                                    className={[
                                        'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium',
                                        CART_COLORS[ idx % CART_COLORS.length ] ?? '',
                                    ].join( ' ' )}
                                >
                                    { subject.name }
                                </span>
                            ) ) }
                        </div>
                    ) }
                </DrawerContent>
            </Drawer>

            {/* Dialog de confirmación de desinscripción desde el calendario */}
            <Dialog open={ subjectToRemove !== null } onOpenChange={ ( open ) => { if ( !open ) setSubjectToRemove( null ); } }>
                <DialogContent showCloseButton={ false }>
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive mb-1">
                            <AlertCircle className="size-5 shrink-0" />
                            <DialogTitle className="text-base font-bold text-foreground">
                                Confirmar Cancelación de Inscripción
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            ¿Estás seguro de que deseas desinscribirte de la asignatura <strong className="text-foreground">{ subjectToRemove?.name }</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-2.5 p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground">
                                Prof. { subjectToRemove?.professor }
                            </p>
                        </div>
                    </div>

                    <div className="my-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-[11px] text-red-600 dark:text-red-400 leading-normal">
                        ⚠ <strong>Importante:</strong> Esta acción liberará tu cupo en esta sección una vez que el servidor la procese.
                    </div>

                    <DialogFooter className="flex gap-2 justify-end">
                        <Button
                            id="calendar-unsubscribe-cancel"
                            variant="outline"
                            onClick={ () => setSubjectToRemove( null ) }
                            className="h-8 text-xs font-semibold"
                        >
                            Cancelar
                        </Button>

                        <Button
                            id="calendar-unsubscribe-accept"
                            disabled={ unsubscribeMutation.isPending }
                            onClick={ handleUnsubscribe }
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
