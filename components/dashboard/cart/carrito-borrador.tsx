'use client';

import { useState }       from 'react';
import { Lock, Save, ShoppingCart } from 'lucide-react';

import { Button }            from '@/components/ui/button';
import { ScrollArea }        from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
}                            from '@/components/ui/dialog';
import { useCart }           from '@/context/cart-context';
import { useStudent }        from '@/hooks/use-student';
import { CartItem }          from './cart-item';
import { ContadorCreditos }  from './contador-creditos';

export function CarritoBorrador(): React.JSX.Element {
    const [ confirmOpen,     setConfirmOpen     ] = useState( false );
    const { draftSubjects, draftStatus, usedCredits, requiredCredits, electiveCredits, freezeDraft } = useCart();
    const { data: student } = useStudent();

    const isFrozen     = draftStatus === 'submitted';
    const totalCredits = student?.totalCredits ?? 30;
    const MIN_CREDITS  = 24;

    function handleFreezeClick(): void {
        if ( usedCredits < MIN_CREDITS ) {
            setConfirmOpen( true );
        } else {
            freezeDraft();
        }
    }

    return (
        <aside className="h-full flex flex-col bg-card relative overflow-hidden">

            {/* Overlay de candado cuando el borrador está congelado */ }
            { isFrozen && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
                    <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="size-7 text-muted-foreground" />
                    </div>
                    <div className="text-center px-6">
                        <p className="text-sm font-semibold text-foreground">Borrador congelado</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tu inscripción ha sido enviada y ya no puede modificarse.
                        </p>
                    </div>
                </div>
            ) }

            {/* Header sticky con KPI de créditos */ }
            <div className="shrink-0">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                    <ShoppingCart className="size-4 text-muted-foreground" />
                    <h2 className="text-sm font-bold text-foreground flex-1">Borrador</h2>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        { draftSubjects.length } ramos
                    </span>
                </div>
            </div>

            {/* Lista de ramos */ }
            <ScrollArea className="flex-1 min-h-0">
                { draftSubjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
                        <span className="text-3xl">🛒</span>
                        <p className="text-xs text-muted-foreground">
                            Añade ramos desde el catálogo para armar tu borrador.
                        </p>
                    </div>
                ) : (
                    <div>
                        { draftSubjects.map( ( subject ) => (
                            <CartItem key={ subject.id } subject={ subject } />
                        ) ) }
                    </div>
                ) }
            </ScrollArea>

            {/* Botón congelar */ }
            { !isFrozen && (
                <div className="shrink-0 p-4 border-t border-border">
                    <Button
                        id="freeze-draft-btn"
                        onClick={ handleFreezeClick }
                        disabled={ draftSubjects.length === 0 }
                        className="w-full h-10 text-sm font-semibold gap-2 bg-primary hover:bg-primary/90"
                    >
                        <Save className="size-4" />
                        Guardar y Congelar Borrador
                    </Button>
                    { draftSubjects.length === 0 && (
                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                            Agrega al menos un ramo para continuar.
                        </p>
                    ) }
                </div>
            ) }

            {/* Soft validation dialog */}
            <Dialog open={ confirmOpen } onOpenChange={ ( _, o ) => { if ( !o ) setConfirmOpen( false ); } }>
                <DialogContent showCloseButton>
                    <DialogHeader>
                        <DialogTitle>¿Enviar borrador con pocos créditos?</DialogTitle>

                        <DialogDescription>
                            Aún tienes{ ' ' }
                            <strong>{ totalCredits - usedCredits } créditos disponibles</strong>{ ' ' }
                            por utilizar este semestre. Puedes enviar tu inscripción ahora, pero te
                            recomendamos completar tu carga académica recomendada de{ ' ' }
                            <strong>{ totalCredits } créditos</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            id="dialog-btn-keep-editing"
                            variant="outline"
                            onClick={ () => setConfirmOpen( false ) }
                        >
                            Seguir editando
                        </Button>

                        <Button
                            id="dialog-btn-confirm-freeze"
                            onClick={ () => { setConfirmOpen( false ); freezeDraft(); } }
                        >
                            Confirmar y Enviar de todas formas
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </aside>
    );
}
