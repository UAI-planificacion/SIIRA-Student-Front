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

const SPACE_TYPE_OPTIONS: Option[] = [
    {
        value : 'ROOM',
        label : 'Sala',
    },
    {
        value : 'STUDY_ROOM',
        label : 'Sala de Estudio',
    },
    {
        value : 'MEETING_ROOM',
        label : 'Sala de Reuniones',
    },
    {
        value : 'POSTGRADUATE_ROOM',
        label : 'Sala de Postgrado',
    },
    {
        value : 'AUDITORIO',
        label : 'Auditorio',
    },
    {
        value : 'LAB',
        label : 'Laboratorio',
    },
    {
        value : 'LABPC',
        label : 'Laboratorio PC',
    },
    {
        value : 'DIS',
        label : 'Disk',
    },
    {
        value : 'CORE',
        label : 'Sala Core',
    },
    {
        value : 'MULTIPURPOSE',
        label : 'Sala Multiuso',
    },
];

export function SpaceTypeFilter( {
    defaultValues,
    onSelectionChange,
    label,
    multiple    = true,
    placeholder = 'Seleccionar Tipos de Espacio',
    disabled    = false,
    className   = '',
}: Props ): JSX.Element {
    return (
        <div className={ [ 'space-y-2', className ].join( ' ' ) }>
            { label && <Label htmlFor="space-type-filter">{ label }</Label> }

            <DynamicSelect
                options             = { SPACE_TYPE_OPTIONS }
                defaultValues       = { defaultValues }
                onSelectionChange   = { onSelectionChange }
                placeholder         = { placeholder }
                disabled            = { disabled }
                multiple            = { multiple }
            />
        </div>
    );
}
