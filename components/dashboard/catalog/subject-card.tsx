'use client';

import { memo, useMemo } from 'react';

import { BookOpen, Clock, User, Zap } from 'lucide-react';

import { Badge }  from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart }   from '@/context/cart-context';
import type { ScheduleSlot, Subject } from '@/types/siira';

interface QuotaIndicatorProps {
    quotas : number;
}

function QuotaIndicator( { quotas }: QuotaIndicatorProps ): React.JSX.Element {
    if ( quotas === 0 ) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                <span className="size-2 rounded-full bg-destructive animate-pulse" />
                Sin cupos
            </span>
        );
    }

    if ( quotas < 5 ) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500">
                <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
                { quotas } cupos
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
            <span className="size-2 rounded-full bg-emerald-500" />
            { quotas } cupos
        </span>
    );
}

interface SubjectCardProps {
    subject : Subject;
}

function SubjectCardInner( { subject }: SubjectCardProps ): React.JSX.Element {
    const { addSubject, removeSubject, isInCart, draftStatus } = useCart();

    const inCart   = isInCart( subject.id );
    const isFrozen = draftStatus === 'submitted';
    const disabled = subject.quotas === 0 || isFrozen;

    const parsedSchedule = useMemo<ScheduleSlot[]>( () => {
        try {
            return JSON.parse( subject.schedule ) as ScheduleSlot[];
        } catch {
            return [];
        }
    }, [ subject.schedule ] );

    const scheduleLabel = parsedSchedule
        .reduce<string[]>( ( acc, slot ) => {
            const existing = acc.find( ( s ) => s.startsWith( slot.day ) );

            if ( existing ) {
                return acc.map( ( s ) =>
                    s.startsWith( slot.day )
                        ? `${ s }, B${ slot.block }`
                        : s
                );
            }

            return [ ...acc, `${ slot.day } B${ slot.block }` ];
        }, [] )
        .join( ' · ' );

    function handleToggle(): void {
        if ( inCart ) {
            removeSubject( subject.id );
        } else {
            addSubject( subject );
        }
    }

    return (
        <div
            className={[
                'group relative rounded-xl border bg-card p-4 transition-all duration-200',
                'hover:shadow-md hover:border-primary/30',
                inCart ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20' : 'border-border',
                isFrozen ? 'opacity-60 pointer-events-none' : '',
            ].join( ' ' )}
        >
            {/* Header */ }
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                    { subject.name }
                </h3>

                <Badge
                    variant={ subject.isRequired ? 'default' : 'secondary' }
                    className={[
                        'shrink-0 text-[10px] font-semibold px-2 py-0.5',
                        subject.isRequired
                            ? 'bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400'
                            : 'bg-muted text-muted-foreground',
                    ].join( ' ' )}
                >
                    { subject.isRequired ? 'Obligatorio' : 'Electivo' }
                </Badge>
            </div>

            {/* Meta info */ }
            <div className="space-y-1 mb-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="size-3 shrink-0" />
                    { subject.professor }
                    <span className="mx-1 text-border">·</span>
                    <BookOpen className="size-3 shrink-0" />
                    { subject.credits } créditos
                    <span className="mx-1 text-border">·</span>
                    <span className="capitalize text-xs">{ subject.kind }</span>
                </p>

                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3 shrink-0" />
                    <span className="truncate">{ scheduleLabel }</span>
                </p>
            </div>

            {/* Description */ }
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                { subject.description }
            </p>

            {/* Footer */ }
            <div className="flex items-center justify-between">
                <QuotaIndicator quotas={ subject.quotas } />

                <Button
                    id={ `btn-subject-${ subject.id }` }
                    size="sm"
                    variant={ inCart ? 'default' : 'outline' }
                    disabled={ disabled && !inCart }
                    onClick={ handleToggle }
                    className={[
                        'h-8 text-xs font-semibold transition-all duration-150',
                        inCart
                            ? 'bg-primary text-primary-foreground'
                            : subject.quotas === 0
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-primary hover:text-primary-foreground',
                    ].join( ' ' )}
                >
                    { inCart ? (
                        <>
                            <Zap className="size-3 mr-1" />
                            Seleccionado
                        </>
                    ) : subject.quotas === 0 ? (
                        'Sin cupos'
                    ) : (
                        'Añadir'
                    ) }
                </Button>
            </div>
        </div>
    );
}

export const SubjectCard = memo( SubjectCardInner );
