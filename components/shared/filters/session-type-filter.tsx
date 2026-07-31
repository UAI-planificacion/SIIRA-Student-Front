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

const SESSION_TYPE_OPTIONS: Option[] = [
    {
        value : 'Cátedra',
        label : 'Cátedra',
    },
    {
        value : 'Taller',
        label : 'Taller',
    },
    {
        value : 'Laboratorio',
        label : 'Laboratorio',
    },
    {
        value : 'Ayudantía',
        label : 'Ayudantía',
    },
];

export function SessionTypeFilter( {
    defaultValues,
    onSelectionChange,
    label,
    multiple    = true,
    placeholder = 'Seleccionar Tipos de Sesión',
    disabled    = false,
    className   = '',
}: Props ): JSX.Element {
    return (
        <div className={ [ 'space-y-2', className ].join( ' ' ) }>
            { label && <Label htmlFor="session-type-filter">{ label }</Label> }

            <DynamicSelect
                options             = { SESSION_TYPE_OPTIONS }
                defaultValues       = { defaultValues }
                onSelectionChange   = { onSelectionChange }
                placeholder         = { placeholder }
                disabled            = { disabled }
                multiple            = { multiple }
            />
        </div>
    );
}
