'use client';

import { useMemo } from 'react';

import { BookOpen, Check, ShoppingCart } from 'lucide-react';

import { Badge }  from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart }        from '@/context/cart-context';
import type { Day, Subject } from '@/types/siira';

// ─── Quota indicator ──────────────────────────────────────────────────────────

interface QuotaIndicatorProps {
    quotas : number;
}

function QuotaIndicator( { quotas }: QuotaIndicatorProps ): React.JSX.Element {
    if ( quotas === 0 ) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive">
                <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
                Sin cupos
            </span>
        );
    }

    if ( quotas < 5 ) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-500">
                <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
                { quotas } cupos
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            { quotas } cupos
        </span>
    );
}

// ─── Subject row ──────────────────────────────────────────────────────────────

interface SubjectRowProps {
    subject : Subject;
}

function SubjectRow( { subject }: SubjectRowProps ): React.JSX.Element {
    const { addSubject, removeSubject, isInCart, draftStatus } = useCart();

    const inCart   = isInCart( subject.id );
    const isFrozen = draftStatus === 'submitted';

    function handleToggle(): void {
        if ( inCart ) {
            removeSubject( subject.id );
        } else {
            addSubject( subject );
        }
    }

    return (
        <div className="flex items-start gap-2 p-2 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors">
            <div className="flex-1 min-w-0">
                {/* Name + kind badge */}
                <div className="flex items-center gap-1.5 mb-0.5">
                    <Badge
                        variant="outline"
                        className={ [
                            'text-[9px] h-3.5 px-1 shrink-0 font-semibold',
                            subject.isRequired
                                ? 'border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10'
                                : 'border-violet-500/40 text-violet-600 dark:text-violet-400 bg-violet-500/10',
                        ].join( ' ' ) }
                    >
                        { subject.isRequired ? 'Req' : 'Elec' }
                    </Badge>

                    <p className="text-xs font-semibold text-foreground truncate leading-tight">
                        { subject.name }
                    </p>
                </div>

                {/* Credits + quotas */}
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <BookOpen className="size-2.5 shrink-0" />
                        { subject.credits } cr
                    </span>

                    <QuotaIndicator quotas={ subject.quotas } />
                </div>
            </div>

            {/* Action button */}
            <Button
                id={ `kanban-btn-${ subject.id }` }
                size="sm"
                variant={ inCart ? 'default' : 'outline' }
                disabled={ ( subject.quotas === 0 || isFrozen ) && !inCart }
                onClick={ handleToggle }
                className="h-7 w-7 p-0 shrink-0"
                aria-label={ inCart ? 'Quitar del borrador' : 'Añadir al borrador' }
            >
                { inCart ? (
                    <Check className="size-3" />
                ) : (
                    <ShoppingCart className="size-3" />
                ) }
            </Button>
        </div>
    );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface BlockCatalogPanelProps {
    block    : number;
    day      : Day;
    subjects : Subject[];
}

export function BlockCatalogPanel( { block, day, subjects }: BlockCatalogPanelProps ): React.JSX.Element {
    const required  = useMemo( () => subjects.filter( ( s ) => s.isRequired ),  [ subjects ] );
    const electives = useMemo( () => subjects.filter( ( s ) => !s.isRequired ), [ subjects ] );

    if ( subjects.length === 0 ) {
        return (
            <div className="w-56 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                    No hay ramos disponibles para este bloque.
                </p>
            </div>
        );
    }

    return (
        <div className="w-64">
            {/* Context header */}
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
                { day } · Bloque { block }
            </p>

            <div className="max-h-72 overflow-y-auto space-y-1 pr-0.5">
                {/* Required first */}
                { required.length > 0 && (
                    <>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 px-0.5 mb-1">
                            ● Obligatorias
                        </p>

                        { required.map( ( s ) => (
                            <SubjectRow key={ s.id } subject={ s } />
                        ) ) }
                    </>
                ) }

                {/* Separator */}
                { required.length > 0 && electives.length > 0 && (
                    <div className="h-px bg-border my-2" />
                ) }

                {/* Electives */}
                { electives.length > 0 && (
                    <>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 px-0.5 mb-1">
                            ○ Electivos / Talleres
                        </p>

                        { electives.map( ( s ) => (
                            <SubjectRow key={ s.id } subject={ s } />
                        ) ) }
                    </>
                ) }
            </div>
        </div>
    );
}
