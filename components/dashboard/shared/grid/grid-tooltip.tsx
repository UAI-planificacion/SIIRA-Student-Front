'use client';

import { BookOpen, Clock, User } from 'lucide-react';

import { Badge }  from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart }   from '@/context/cart-context';
import type { ScheduleSlot, Subject } from '@/types/siira';

interface GridTooltipProps {
    subject      : Subject;
    x            : number;
    y            : number;
    alignX       : 'left' | 'right';
    alignY       : 'top' | 'bottom';
    onMouseEnter : () => void;
    onMouseLeave : () => void;
    onClose      : () => void;
}


function parseSchedule( raw: string ): ScheduleSlot[] {
    try {
        return JSON.parse( raw ) as ScheduleSlot[];
    } catch {
        return [];
    }
}


function getScheduleLabel( slots: ScheduleSlot[] ): string {
    return slots
        .reduce<string[]>( ( acc, slot ) => {
            const existing = acc.find( ( s ) => s.startsWith( slot.day ) );

            if ( existing ) {
                return acc.map( ( s ) =>
                    s.startsWith( slot.day ) ? `${ s }, B${ slot.block }` : s
                );
            }

            return [ ...acc, `${ slot.day } B${ slot.block }` ];
        }, [] )
        .join( ' · ' );
}


export function GridTooltip( {
    subject,
    x,
    y,
    alignX,
    alignY,
    onMouseEnter,
    onMouseLeave,
    onClose,
}: GridTooltipProps ): React.JSX.Element {
    const { addSubject, removeSubject, isInCart, draftStatus } = useCart();

    const inCart   = isInCart( subject.id );
    const isFrozen = draftStatus === 'submitted';
    const disabled = subject.quotas === 0 && !inCart;

    const slots      = parseSchedule( subject.schedule );
    const schedLabel = getScheduleLabel( slots );


    function handleToggle(): void {
        if ( inCart ) {
            removeSubject( subject.id );
        } else {
            addSubject( subject );
        }
        onClose();
    }

    const tooltipWidth  = 300;
    const tooltipHeight = 240;

    const left = alignX === 'left' ? x - tooltipWidth - 12 : x + 12;
    const top  = alignY === 'bottom' ? y - tooltipHeight + 40 : y;

    return (
        <div
            onMouseEnter = { onMouseEnter }
            onMouseLeave = { onMouseLeave }
            style        = {({
                position      : 'fixed',
                top           : Math.max( 12, top ),
                left          : left,
                zIndex        : 9999,
                width         : `${ tooltipWidth }px`,
                pointerEvents : 'auto',
            })}
            className    = {([
                'rounded-xl border border-border bg-popover shadow-xl p-4.5 space-y-4 text-popover-foreground',
                'transition-all animate-in fade-in zoom-in-95 duration-100',
            ].join( ' ' ))}
        >
            {/* Name + Badge */}
            <div className="flex items-start gap-3">
                <p className="text-sm font-bold text-foreground leading-snug flex-1">
                    { subject.name }
                </p>
                <Badge
                    variant   = "secondary"
                    className = {([
                        'shrink-0 text-[10px] px-2 py-0.5 font-semibold',
                        subject.isRequired
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                            : 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
                    ].join( ' ' ))}
                >
                    { subject.isRequired ? 'Obligatorio' : 'Electivo' }
                </Badge>
            </div>

            {/* Meta */}
            <div className="space-y-1.5 border-b border-border/40 pb-3">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="size-3.5 shrink-0" />
                    <span className="font-medium text-foreground/90">{ subject.professor }</span>
                    <span className="mx-0.5 text-border">·</span>
                    <BookOpen className="size-3.5 shrink-0" />
                    <span>{ subject.credits } cr.</span>
                </p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5 shrink-0" />
                    <span className="truncate">{ schedLabel }</span>
                </p>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed">
                { subject.description }
            </p>

            {/* Quotas & Action */}
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
                { subject.quotas === 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive animate-pulse">
                        <span className="size-2 rounded-full bg-destructive" /> Sin cupos
                    </span>
                ) : subject.quotas < 5 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 animate-pulse">
                        <span className="size-2 rounded-full bg-orange-500 animate-pulse" /> { subject.quotas } cupos
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 animate-pulse">
                        <span className="size-2 rounded-full bg-emerald-500" /> { subject.quotas } cupos
                    </span>
                ) }

                <Button
                    id        = { `tooltip-btn-${ subject.id }` }
                    size      = "sm"
                    variant   = { inCart ? 'default' : 'outline' }
                    disabled  = { disabled && !isFrozen ? disabled : isFrozen }
                    onClick   = { handleToggle }
                    className = "h-8 text-xs font-bold px-4"
                >
                    { isFrozen ? '🔒' : inCart ? 'Quitar' : disabled ? 'Sin cupos' : 'Añadir' }
                </Button>
            </div>
        </div>
    );
}
