'use client';

import { Clock, User } from 'lucide-react';

import { Badge }                        from '@/components/ui/badge';
import type { Subject, SubjectSection } from '@/types/siira';


interface GridTooltipProps {
    subject      : Subject;
    section      : SubjectSection;
    x            : number;
    y            : number;
    alignX       : 'left' | 'right';
    alignY       : 'top' | 'bottom';
    onMouseEnter : () => void;
    onMouseLeave : () => void;
    onClose      : () => void;
}


export function GridTooltip( {
    subject,
    section,
    x,
    y,
    alignX,
    alignY,
    onMouseEnter,
    onMouseLeave,
}: GridTooltipProps ): React.JSX.Element {
    const historyStatus = subject.academicHistory?.status ?? null;
    const finalGrade    = subject.academicHistory?.finalGrade ?? null;

    let academicStatusLabel = '';
    let statusBadgeClass    = '';

    if ( historyStatus === 'APPROVED' ) {
        academicStatusLabel = `Aprobado ${ finalGrade !== null ? `(${ finalGrade })` : '' }`;
        statusBadgeClass    = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    } else if ( historyStatus === 'FAILED' ) {
        academicStatusLabel = `Reprobado ${ finalGrade !== null ? `(${ finalGrade })` : '' }`;
        statusBadgeClass    = 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20';
    } else if ( historyStatus === 'IN_PROGRESS' ) {
        academicStatusLabel = 'Cursando';
        statusBadgeClass    = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    } else if ( historyStatus === 'CREDITED' ) {
        academicStatusLabel = 'Homologado';
        statusBadgeClass    = 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20';
    }

    const tooltipWidth = 320;
    const left         = alignX === 'left' ? x - tooltipWidth - 12 : x + 12;
    const top          = alignY === 'bottom' ? y - 180 : y;

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
                'rounded-xl border border-border bg-popover shadow-xl p-4.5 space-y-4 text-popover-foreground max-h-100 overflow-y-auto',
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

            {/* SSEC & SpaceType */}
            <div className="flex items-center justify-between text-xs border-b border-border/40 pb-3">
                <span className="font-bold text-primary dark:text-primary-foreground">
                    SSEC: { section.ssec }
                </span>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                    { subject.credits } cr. · { section.sessionName }
                </span>
            </div>

            {/* Session Detail */}
            <div className="space-y-3 text-xs border-b border-border/40 pb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Detalle de la Sesión
                </p>

                <div className="space-y-2 rounded-lg border border-border/40 bg-muted/10 p-3">
                    <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-muted-foreground" />
                            { section.day } · { section.timeLabel }
                        </span>
                        { section.isEnglish && (
                            <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-purple-400/40 text-purple-600 dark:text-purple-400 font-bold">
                                Inglés
                            </Badge>
                        ) }
                    </div>

                    <div className="space-y-1 text-muted-foreground mt-2">
                        <p className="flex items-center gap-1.5">
                            <User className="size-3 shrink-0" />
                            <span className="font-medium text-foreground">{ section.professor }</span>
                            { section.profEmail && (
                                <span className="opacity-70 text-[10px]">({ section.profEmail })</span>
                            ) }
                        </p>

                        <p className="pl-5 text-[11px]">
                            🏢 { section.building ?? 'Sin pabellón' } · Sala: { section.spaceType ?? 'N/A' }
                        </p>
                    </div>
                </div>
            </div>

            {/* Description */}
            { subject.description && (
                <p className="text-xs text-muted-foreground leading-relaxed border-b border-border/40 pb-3">
                    { subject.description }
                </p>
            ) }

            {/* Quotas & Status */}
            <div className="flex items-center justify-between pt-1 text-xs">
                { section.quotas === 0 ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-destructive animate-pulse">
                        <span className="size-2 rounded-full bg-destructive" /> Sin cupos
                    </span>
                ) : section.quotas < 5 ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-orange-500 animate-pulse">
                        <span className="size-2 rounded-full bg-orange-500 animate-pulse" /> { section.quotas }/{ section.capacity } cupos
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-500">
                        <span className="size-2 rounded-full bg-emerald-500" /> { section.quotas }/{ section.capacity } cupos
                    </span>
                ) }

                { academicStatusLabel && (
                    <span className={ [ "px-2 py-0.5 rounded font-bold text-[9px] border", statusBadgeClass ].join( ' ' ) }>
                        { academicStatusLabel }
                    </span>
                ) }
            </div>
        </div>
    );
}
