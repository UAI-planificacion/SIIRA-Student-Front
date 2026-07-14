import { Skeleton } from '@/components/ui/skeleton';

// ─── Single node skeleton ─────────────────────────────────────────────────────

function MallaNodeSkeleton(): React.JSX.Element {
    return (
        <div className="rounded-xl border border-border bg-card p-3 animate-pulse space-y-2">
            <Skeleton className="h-3.5 w-4/5 rounded" />
            <Skeleton className="h-3.5 w-3/5 rounded" />
            <Skeleton className="h-3 w-1/3 rounded" />
        </div>
    );
}

// ─── Single column skeleton ───────────────────────────────────────────────────

interface SemesterColumnSkeletonProps {
    itemCount ?: number;
}

function SemesterColumnSkeleton( { itemCount = 3 }: SemesterColumnSkeletonProps ): React.JSX.Element {
    return (
        <div className="flex flex-col gap-2 w-44 shrink-0">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-1 px-1">
                <Skeleton className="h-4 w-20 rounded" />
            </div>

            {/* Nodes */}
            { Array.from( { length: itemCount } ).map( ( _, i ) => (
                <MallaNodeSkeleton key={ i } />
            ) ) }
        </div>
    );
}

// ─── Full malla skeleton ──────────────────────────────────────────────────────

const SKELETON_COLUMNS: number[] = [ 3, 3, 3, 3, 3, 4 ];

export function MallaSkeleton(): React.JSX.Element {
    return (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 h-full p-4 min-w-max">
                { SKELETON_COLUMNS.map( ( count, i ) => (
                    <SemesterColumnSkeleton key={ i } itemCount={ count } />
                ) ) }
            </div>
        </div>
    );
}
