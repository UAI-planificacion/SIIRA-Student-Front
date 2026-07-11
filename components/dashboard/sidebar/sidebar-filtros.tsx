'use client';

import { useFilters } from '@/context/filters-context';
import { Switch }     from '@/components/ui/switch';
import { Separator }  from '@/components/ui/separator';
import { Search, Filter } from 'lucide-react';

export function SidebarFiltros(): React.JSX.Element {
    const {
        searchQuery,
        showRequired,
        showOptional,
        scheduleBlock,
        hideCollisions,
        hideNoQuotas,
        setSearchQuery,
        setShowRequired,
        setShowOptional,
        setScheduleBlock,
        setHideCollisions,
        setHideNoQuotas,
    } = useFilters();

    return (
        <aside className="h-full flex flex-col gap-5 overflow-y-auto px-4 py-5 bg-sidebar">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Filter className="size-3.5 text-primary-foreground" />
                </div>
                <h1 className="text-sm font-bold text-foreground tracking-tight">Filtros</h1>
            </div>

            <Separator />

            {/* Búsqueda */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Búsqueda
                </label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Nombre, profesor..."
                        value={ searchQuery }
                        onChange={ ( e ) => setSearchQuery( e.target.value ) }
                        className={[
                            'w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-input bg-background',
                            'placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring',
                            'transition-shadow duration-150',
                        ].join( ' ' )}
                    />
                </div>
            </div>

            <Separator />

            {/* Tipo de asignatura */}
            <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tipo de asignatura
                </p>

                <label
                    htmlFor="filter-required"
                    className="flex items-center justify-between cursor-pointer group"
                >
                    <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors">
                        Obligatorias
                    </span>
                    <input
                        id="filter-required"
                        type="checkbox"
                        checked={ showRequired }
                        onChange={ ( e ) => setShowRequired( e.target.checked ) }
                        className="size-4 rounded border-input accent-primary cursor-pointer"
                    />
                </label>

                <label
                    htmlFor="filter-optional"
                    className="flex items-center justify-between cursor-pointer group"
                >
                    <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors">
                        Electivas
                    </span>
                    <input
                        id="filter-optional"
                        type="checkbox"
                        checked={ showOptional }
                        onChange={ ( e ) => setShowOptional( e.target.checked ) }
                        className="size-4 rounded border-input accent-primary cursor-pointer"
                    />
                </label>
            </div>

            <Separator />

            {/* Bloque horario */}
            <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Bloque horario
                </p>

                { (
                    [
                        { value: 'all',       label: 'Todos los horarios' },
                        { value: 'morning',   label: 'Mañana (B1 – B4)' },
                        { value: 'afternoon', label: 'Tarde (B5 – B8)' },
                    ] as const
                ).map( ( { value, label } ) => (
                    <label
                        key={ value }
                        htmlFor={ `schedule-${ value }` }
                        className="flex items-center gap-2.5 cursor-pointer group"
                    >
                        <input
                            id={ `schedule-${ value }` }
                            type="radio"
                            name="schedule-block"
                            value={ value }
                            checked={ scheduleBlock === value }
                            onChange={ () => setScheduleBlock( value ) }
                            className="size-4 accent-primary cursor-pointer"
                        />
                        <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors">
                            { label }
                        </span>
                    </label>
                ) ) }
            </div>

            <Separator />

            {/* Sección Cupos y Horario */}
            <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cupos y Horario
                </p>

                {/* Ocultar sin cupos */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                        <label
                            htmlFor="hide-no-quotas"
                            className="text-sm text-foreground leading-snug cursor-pointer"
                        >
                            Ocultar sin cupos
                        </label>
                        <Switch
                            id="hide-no-quotas"
                            checked={ hideNoQuotas }
                            onCheckedChange={ setHideNoQuotas }
                        />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Oculta ramos con 0 cupos disponibles.
                    </p>
                </div>

                {/* Ocultar colisiones */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                        <label
                            htmlFor="hide-collisions"
                            className="text-sm text-foreground leading-snug cursor-pointer"
                        >
                            Ocultar colisiones
                        </label>
                        <Switch
                            id="hide-collisions"
                            checked={ hideCollisions }
                            onCheckedChange={ setHideCollisions }
                        />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Filtra ramos que se solapan con tu carrito.
                    </p>
                </div>
            </div>
        </aside>
    );
}
