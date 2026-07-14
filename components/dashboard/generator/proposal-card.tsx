'use client';

import { memo } from 'react';

import { BookOpen, Check, Users } from 'lucide-react';

import type { ScheduleProposal }    from '@/lib/schedule-generator';
import { Badge }                    from '@/components/ui/badge';
import { Button }                   from '@/components/ui/button';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProposalCardProps {
    proposal            : ScheduleProposal;
    index               : number;
    isActive            : boolean;
    isAlreadyApplied    : boolean;
    onActivate          : () => void;
    onDeactivate        : () => void;
    onApply             : () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
function ProposalCardInner(
    { proposal, index, isActive, isAlreadyApplied, onActivate, onDeactivate, onApply }: ProposalCardProps
): React.JSX.Element {
    return (
        <div
            onMouseEnter={ onActivate }
            onMouseLeave={ onDeactivate }
            onClick={ onActivate }
            className={ [
                'relative flex flex-col gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 group min-w-[220px]',
                isActive
                    ? 'border-primary/60 bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-sm',
            ].join( ' ' ) }
        >
            {/* Option number badge */}
            <div className={ [
                'absolute top-3 right-3 size-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors',
                isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
            ].join( ' ' ) }>
                { index + 1 }
            </div>

            {/* Header */}
            <div className="pr-8">
                <span className="text-lg leading-none">{ proposal.emoji }</span>

                <h3 className="text-sm font-bold text-foreground mt-1 leading-snug">
                    { proposal.label }
                </h3>

                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    { proposal.subtitle }
                </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <BookOpen className="size-3 shrink-0" />
                    { proposal.totalCredits } créditos
                </span>

                <span className="text-border text-[10px]">·</span>

                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="size-3 shrink-0" />
                    { proposal.subjects.length } ramos
                </span>
            </div>

            {/* Subject list */}
            <ul className="space-y-1">
                { proposal.subjects.map( ( subject ) => (
                    <li
                        key={ subject.id }
                        className="flex items-start gap-1.5"
                    >
                        <span className={ [
                            'mt-0.5 size-1.5 rounded-full shrink-0',
                            subject.isRequired ? 'bg-blue-500' : 'bg-violet-400',
                        ].join( ' ' ) } />

                        <span className="text-[10px] text-foreground leading-tight line-clamp-1">
                            { subject.name }
                        </span>

                        <Badge
                            variant="outline"
                            className="ml-auto text-[8px] h-3.5 px-1 shrink-0 border-border/60 text-muted-foreground"
                        >
                            { subject.credits }cr
                        </Badge>
                    </li>
                ) ) }
            </ul>

            {/* Active indicator */}
            { isActive && (
                <p className="text-[9px] text-primary font-medium">
                    ↓ Viendo en el calendario abajo
                </p>
            ) }

            {/* CTA */}
            <Button
                id={ `btn-apply-proposal-${ proposal.id }` }
                size="sm"
                variant={ isAlreadyApplied ? 'default' : 'outline' }
                disabled={ isAlreadyApplied }
                onClick={ ( e ) => {
                    e.stopPropagation();
                    onApply();
                } }
                className="h-8 text-xs font-semibold w-full mt-auto"
            >
                { isAlreadyApplied ? (
                    <>
                        <Check className="size-3 mr-1.5" />
                        Ya aplicado
                    </>
                ) : (
                    '✅ Aplicar esta Combinación'
                ) }
            </Button>
        </div>
    );
}

export const ProposalCard = memo( ProposalCardInner );
