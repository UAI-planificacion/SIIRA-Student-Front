'use client';

import { X, BookOpen } from 'lucide-react';

import { Button }    from '@/components/ui/button';
import { useCart }   from '@/context/cart-context';
import { useExecutionMode } from '@/hooks/use-execution-mode';
import type { Subject } from '@/types/siira';

interface CartItemProps {
    subject : Subject;
}

export function CartItem( { subject }: CartItemProps ): React.JSX.Element {
    const { removeSubject, draftStatus } = useCart();
    const { mode } = useExecutionMode();
    const isFrozen = draftStatus === 'submitted';

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

            { !isFrozen && mode !== 'toma_ramos' && (
                <Button
                    id={ `remove-${ subject.id }` }
                    variant="ghost"
                    size="icon"
                    onClick={ () => removeSubject( subject.id ) }
                    className="size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label={ `Eliminar ${ subject.name }` }
                >
                    <X className="size-3" />
                </Button>
            ) }
        </div>
    );
}
