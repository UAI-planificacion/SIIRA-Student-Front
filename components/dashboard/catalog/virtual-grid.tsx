'use client';

import { useEffect, useRef } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

import { SubjectCard } from './subject-card';
import type { Subject } from '@/types/siira';

interface VirtualGridProps {
    subjects : Subject[];
}

export function VirtualGrid( { subjects }: VirtualGridProps ): React.JSX.Element {
    const parentRef = useRef<HTMLDivElement>( null );

    const rowVirtualizer = useVirtualizer({
        count       : subjects.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 180,
        overscan    : 5,
    });

    // Reset scroll when subjects list changes (e.g. new filters applied)
    useEffect( () => {
        parentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }, [ subjects.length ] );

    return (
        <div
            ref={ parentRef }
            className="overflow-y-auto h-full"
            style={{ contain: 'strict' }}
        >
            <div
                style={{
                    height   : rowVirtualizer.getTotalSize(),
                    position : 'relative',
                    width    : '100%',
                }}
            >
                { rowVirtualizer.getVirtualItems().map( ( virtualRow ) => {
                    const subject = subjects[ virtualRow.index ];

                    if ( !subject ) return null;

                    return (
                        <div
                            key={ subject.id }
                            data-index={ virtualRow.index }
                            ref={ rowVirtualizer.measureElement }
                            style={{
                                position  : 'absolute',
                                top       : 0,
                                left      : 0,
                                width     : '100%',
                                transform : `translateY(${ virtualRow.start }px)`,
                                padding   : '0 0 12px 0',
                            }}
                        >
                            <SubjectCard subject={ subject } />
                        </div>
                    );
                } ) }
            </div>
        </div>
    );
}
