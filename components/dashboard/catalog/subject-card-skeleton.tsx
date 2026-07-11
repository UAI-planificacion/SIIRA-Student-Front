import { Skeleton } from '@/components/ui/skeleton';

export function SubjectCardSkeleton(): React.JSX.Element {
    return (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse">
            <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-3/5 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-2/5 rounded" />
                <Skeleton className="h-3.5 w-1/3 rounded" />
            </div>

            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-4/5 rounded" />

            <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
        </div>
    );
}
