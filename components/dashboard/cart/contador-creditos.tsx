'use client';

interface ContadorCreditosProps {
    usedCredits     : number;
    totalCredits    : number;
    requiredCredits : number;
    electiveCredits : number;
}

export function ContadorCreditos(
    { usedCredits, totalCredits, requiredCredits, electiveCredits }: ContadorCreditosProps
): React.JSX.Element {
    const isOver    = usedCredits > totalCredits;
    const total     = Math.max( totalCredits, 1 );

    const reqPct  = Math.min( ( requiredCredits / total ) * 100, 100 );
    const elecPct = Math.min( ( electiveCredits / total ) * 100, 100 - reqPct );

    const counterColor = isOver
        ? 'text-destructive'
        : usedCredits >= totalCredits
            ? 'text-yellow-500'
            : 'text-foreground';

    return (
        <div className="space-y-2 px-4 py-3 border-b border-border">
            {/* Label + counter */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Créditos
                </span>

                <span className={ `text-sm font-bold tabular-nums ${ counterColor }` }>
                    { usedCredits }
                    <span className="text-muted-foreground font-normal"> / { totalCredits } cr.</span>
                </span>
            </div>

            {/* Stacked progress bar */}
            <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
                {/* Required — blue */}
                <div
                    className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                    style={ { width: `${ reqPct }%` } }
                />

                {/* Elective — violet */}
                <div
                    className="absolute top-0 h-full bg-violet-500 transition-all duration-300"
                    style={ { left: `${ reqPct }%`, width: `${ elecPct }%` } }
                />
            </div>

            {/* Breakdown badges */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                    Obligatorios: <strong className="text-foreground">{ requiredCredits } cr.</strong>
                </span>

                <span className="text-border text-[10px]">|</span>

                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="size-2 rounded-full bg-violet-500 shrink-0" />
                    Electivos: <strong className="text-foreground">{ electiveCredits } cr.</strong>
                </span>
            </div>

            { isOver && (
                <p className="text-[10px] text-destructive font-medium">
                    ⚠ Excedes el límite de créditos permitidos.
                </p>
            ) }
        </div>
    );
}
