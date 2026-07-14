'use client';

import { memo } from 'react';

import {
    BookOpen,
    Check,
    CheckCircle2,
    Clock,
    ShoppingCart,
    User,
} from 'lucide-react';

import { Badge }   from '@/components/ui/badge';
import { Button }  from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useCart }              from '@/context/cart-context';
import type { ScheduleSlot, Subject, SubjectAcademicStatus } from '@/types/siira';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseSchedule( raw: string ): ScheduleSlot[] {
    try {
        return JSON.parse( raw ) as ScheduleSlot[];
    } catch {
        return [];
    }
}

function buildScheduleLabel( slots: ScheduleSlot[] ): string {
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

// ─── Status style map ────────────────────────────────────────────────────────

const STATUS_STYLES: Record<SubjectAcademicStatus, string> = {
    approved            : 'opacity-50 bg-muted/60 border-border cursor-default select-none',
    failed_or_pending   : 'border-yellow-500/50 bg-yellow-500/5 hover:border-yellow-500/70',
    available_to_enroll : 'border-primary/30 bg-card hover:border-primary/60 hover:shadow-md hover:shadow-primary/10 cursor-pointer',
};

// ─── QuotaIndicator ──────────────────────────────────────────────────────────

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

// ─── Popover inner content ────────────────────────────────────────────────────

interface MallaNodePopoverContentProps {
    subject : Subject;
}

function MallaNodePopoverContent( { subject }: MallaNodePopoverContentProps ): React.JSX.Element {
    const { addSubject, removeSubject, isInCart, draftStatus } = useCart();

    const inCart   = isInCart( subject.id );
    const isFrozen = draftStatus === 'submitted';
    const slots    = parseSchedule( subject.schedule );

    function handleToggle(): void {
        if ( inCart ) {
            removeSubject( subject.id );
        } else {
            addSubject( subject );
        }
    }

    return (
        <div className="w-56">
            {/* Meta */}
            <div className="mb-3">
                <p className="text-sm font-semibold text-foreground leading-snug">
                    { subject.name }
                </p>

                <p className="text-xs text-muted-foreground mt-0.5">
                    { subject.credits } créditos · <span className="capitalize">{ subject.kind }</span>
                </p>
            </div>

            <div className="space-y-1.5 mb-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="size-3 shrink-0" />
                    { subject.professor }
                </p>

                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3 shrink-0" />
                    <span className="truncate">{ buildScheduleLabel( slots ) }</span>
                </p>

                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BookOpen className="size-3 shrink-0" />
                    <QuotaIndicator quotas={ subject.quotas } />
                </p>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                { subject.description }
            </p>

            {/* CTA */}
            <Button
                id={ `malla-btn-${ subject.id }` }
                size="sm"
                variant={ inCart ? 'default' : 'outline' }
                disabled={ ( subject.quotas === 0 || isFrozen ) && !inCart }
                onClick={ handleToggle }
                className="w-full h-8 text-xs font-semibold"
            >
                { inCart ? (
                    <>
                        <Check className="size-3 mr-1.5" />
                        Seleccionado
                    </>
                ) : subject.quotas === 0 ? (
                    'Sin cupos disponibles'
                ) : (
                    <>
                        <ShoppingCart className="size-3 mr-1.5" />
                        Añadir al carrito
                    </>
                ) }
            </Button>
        </div>
    );
}

// ─── Node card (shared visual) ────────────────────────────────────────────────

interface NodeCardProps {
    subject : Subject;
    inCart  : boolean;
}

function NodeCard( { subject, inCart }: NodeCardProps ): React.JSX.Element {
    const isApproved    = subject.academicStatus === 'approved';
    const isInteractive = subject.academicStatus === 'available_to_enroll';

    return (
        <div className={[
            'relative rounded-xl border p-3 transition-all duration-200 group w-full',
            STATUS_STYLES[ subject.academicStatus ],
            inCart && isInteractive ? 'ring-1 ring-primary/40 border-primary/60 bg-primary/5' : '',
        ].join( ' ' )}>
            {/* Approved icon */}
            { isApproved && (
                <div className="absolute top-2 right-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                </div>
            ) }

            {/* In-cart dot */}
            { inCart && isInteractive && (
                <div className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
            ) }

            {/* Name */}
            <p className={[
                'text-xs font-semibold leading-tight line-clamp-2 pr-4',
                isApproved ? 'text-muted-foreground' : 'text-foreground',
            ].join( ' ' )}>
                { subject.name }
            </p>

            {/* Credits + kind */}
            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                <span>{ subject.credits } cr</span>
                <span className="text-border">·</span>
                <span className="capitalize">{ subject.kind }</span>
            </p>

            {/* Failed badge */}
            { subject.academicStatus === 'failed_or_pending' && (
                <Badge
                    variant="outline"
                    className="mt-1.5 text-[9px] h-4 px-1.5 border-yellow-500/50 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10"
                >
                    Pendiente
                </Badge>
            ) }

            {/* Hover hint for interactive */}
            { isInteractive && !inCart && (
                <p className="text-[9px] text-primary/60 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Clic para inscribir
                </p>
            ) }
        </div>
    );
}

// ─── Main node ───────────────────────────────────────────────────────────────

interface MallaNodeProps {
    subject            : Subject;
    scrollContainerRef : React.RefObject<HTMLDivElement | null>;
}

function MallaNodeInner( { subject, scrollContainerRef }: MallaNodeProps ): React.JSX.Element {
    const { isInCart } = useCart();
    const inCart       = isInCart( subject.id );
    const isInteractive = subject.academicStatus === 'available_to_enroll';

    // Non-interactive nodes: render plain card
    if ( !isInteractive ) {
        return <NodeCard subject={ subject } inCart={ inCart } />;
    }

    // Interactive node — Base UI's PopoverTrigger is a native <button>.
    // We pass NodeCard as children so the button wraps the card visually
    // while keeping all button semantics for keyboard / accessibility.
    return (
        <Popover>
            <PopoverTrigger
                className="block w-full text-left bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:rounded-xl"
                onClick={ () => {
                    // Attach one-time scroll listener to close popover on horizontal scroll
                    scrollContainerRef.current?.addEventListener(
                        'scroll',
                        () => document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Escape', bubbles: true } ) ),
                        { once: true }
                    );
                } }
            >
                <NodeCard subject={ subject } inCart={ inCart } />
            </PopoverTrigger>

            <PopoverContent
                side="bottom"
                align="start"
                sideOffset={ 6 }
            >
                <MallaNodePopoverContent subject={ subject } />
            </PopoverContent>
        </Popover>
    );
}

export const MallaNode = memo( MallaNodeInner );
