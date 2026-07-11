'use client';

import { Progress } from '@/components/ui/progress';

interface ContadorCreditosProps {
    usedCredits  : number;
    totalCredits : number;
}

export function ContadorCreditos( { usedCredits, totalCredits }: ContadorCreditosProps ): React.JSX.Element {
    const percent  = totalCredits > 0 ? Math.min( ( usedCredits / totalCredits ) * 100, 100 ) : 0;
    const isOver   = usedCredits > totalCredits;
    const isWarning = !isOver && percent >= 80;

    const barColor = isOver
        ? '[&>div]:bg-destructive'
        : isWarning
            ? '[&>div]:bg-yellow-500'
            : '[&>div]:bg-emerald-500';

    return (
        <div className="space-y-2 px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Créditos
                </span>
                <span className={[
                    'text-sm font-bold tabular-nums',
                    isOver    ? 'text-destructive' :
                    isWarning ? 'text-yellow-500'  :
                    'text-foreground',
                ].join( ' ' )}>
                    { usedCredits }
                    <span className="text-muted-foreground font-normal"> / { totalCredits } cr.</span>
                </span>
            </div>

            <Progress
                value={ percent }
                className={`h-2 bg-muted ${ barColor }`}
            />

            { isOver && (
                <p className="text-[10px] text-destructive font-medium">
                    ⚠ Excedes el límite de créditos permitidos.
                </p>
            ) }
        </div>
    );
}
