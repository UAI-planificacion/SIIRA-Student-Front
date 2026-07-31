'use client';

import { JSX } from 'react';

import { Label }          from '@/components/ui/label';
import { DynamicSelect }   from '@/components/dashboard/shared/inputs/DynamicSelect';
import type { Option }     from '@/components/dashboard/shared/inputs/DynamicSelect';

interface Props {
    defaultValues      : string | string[] | undefined;
    onSelectionChange? : ( selectedValues: string[] | string | undefined ) => void;
    multiple?          : boolean;
    label?             : string;
    placeholder?       : string;
    disabled?          : boolean;
    className?         : string;
}

const DAY_OPTIONS: Option[] = [
    {
        value : 'Lunes',
        label : 'Lunes',
    },
    {
        value : 'Martes',
        label : 'Martes',
    },
    {
        value : 'Miércoles',
        label : 'Miércoles',
    },
    {
        value : 'Jueves',
        label : 'Jueves',
    },
    {
        value : 'Viernes',
        label : 'Viernes',
    },
    {
        value : 'Sábado',
        label : 'Sábado',
    },
];

export function DayFilter( {
    defaultValues,
    onSelectionChange,
    label,
    multiple    = true,
    placeholder = 'Seleccionar Días',
    disabled    = false,
    className   = '',
}: Props ): JSX.Element {
    return (
        <div className={ [ 'space-y-2', className ].join( ' ' ) }>
            { label && <Label htmlFor="day-filter">{ label }</Label> }

            <DynamicSelect
                options             = { DAY_OPTIONS }
                defaultValues       = { defaultValues }
                onSelectionChange   = { onSelectionChange }
                placeholder         = { placeholder }
                disabled            = { disabled }
                multiple            = { multiple }
            />
        </div>
    );
}
