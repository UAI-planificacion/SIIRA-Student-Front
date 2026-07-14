import { Skeleton } from '@/components/ui/skeleton';
import { BLOCK_LABELS, DAYS } from '@/lib/blocks';

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlockLaneSkeletonProps {
    block : number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlockLaneSkeleton( { block }: BlockLaneSkeletonProps ): React.JSX.Element {
    const label = BLOCK_LABELS[ block ];

    return (
        <div className="flex flex-col gap-2 w-52 shrink-0 rounded-xl border border-border bg-background p-3">
            {/* Header */}
            <div className="text-center pb-2 border-b border-border animate-pulse space-y-1.5">
                <Skeleton className="h-3 w-16 mx-auto rounded" />
                <Skeleton className="h-5 w-12 mx-auto rounded" />
            </div>

            {/* Day rows */}
            <div className="flex flex-col gap-1.5">
                { DAYS.map( ( day ) => (
                    <div
                        key={ day }
                        className="flex items-center gap-2 h-10 animate-pulse"
                    >
                        <Skeleton className="h-3 w-4 rounded shrink-0" />
                        <Skeleton className="h-full flex-1 rounded-lg" />
                    </div>
                ) ) }
            </div>
        </div>
    );
}
