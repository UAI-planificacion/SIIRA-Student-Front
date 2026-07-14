'use client';

import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Day } from '@/types/siira';
import type {
    DayDistribution,
    SchedulePreferences,
    TimePreference,
} from '@/lib/schedule-generator';
import { DAYS } from '@/lib/blocks';

// ─── Toggle button helper ─────────────────────────────────────────────────────

interface ToggleProps {
    id        : string;
    active    : boolean;
    onClick   : () => void;
    children  : React.ReactNode;
    className ?: string;
}

function Toggle( { id, active, onClick, children, className = '' }: ToggleProps ): React.JSX.Element {
    return (
        <button
            id={ id }
            type="button"
            onClick={ onClick }
            className={ [
                'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150',
                active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground',
                className,
            ].join( ' ' ) }
        >
            { children }
        </button>
    );
}

// ─── Day checkbox ─────────────────────────────────────────────────────────────

interface DayCheckboxProps {
    day      : Day;
    checked  : boolean;
    onToggle : ( day: Day ) => void;
}

function DayCheckbox( { day, checked, onToggle }: DayCheckboxProps ): React.JSX.Element {
    const abbr = day.slice( 0, 2 );

    return (
        <button
            id={ `pref-free-day-${ day }` }
            type="button"
            onClick={ () => onToggle( day ) }
            className={ [
                'w-9 h-9 rounded-lg border text-xs font-semibold transition-all duration-150',
                checked
                    ? 'bg-destructive/15 text-destructive border-destructive/40 dark:text-red-400'
                    : 'bg-background text-muted-foreground border-border hover:border-muted-foreground/40',
            ].join( ' ' ) }
            aria-pressed={ checked }
            aria-label={ `${ checked ? 'Desmarcar' : 'Marcar' } ${ day } como día libre` }
        >
            { abbr }
        </button>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SchedulePreferencesFormProps {
    preferences  : SchedulePreferences;
    isGenerating : boolean;
    onChange     : ( prefs: SchedulePreferences ) => void;
    onGenerate   : () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SchedulePreferencesForm(
    { preferences, isGenerating, onChange, onGenerate }: SchedulePreferencesFormProps
): React.JSX.Element {

    function setTimePreference( tp: TimePreference ): void {
        onChange( { ...preferences, timePreference: tp } );
    }

    function setDistribution( dist: DayDistribution ): void {
        onChange( { ...preferences, distribution: dist } );
    }

    function toggleFreeDay( day: Day ): void {
        const next = preferences.freeDays.includes( day )
            ? preferences.freeDays.filter( ( d ) => d !== day )
            : [ ...preferences.freeDays, day ];

        onChange( { ...preferences, freeDays: next } );
    }

    return (
        <div className="shrink-0 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="flex flex-wrap items-end gap-6">
                {/* Preference horaria */}
                <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Horario preferido
                    </p>

                    <div className="flex gap-1.5">
                        <Toggle
                            id="pref-time-morning"
                            active={ preferences.timePreference === 'morning' }
                            onClick={ () => setTimePreference( 'morning' ) }
                        >
                            🌅 Mañana
                        </Toggle>

                        <Toggle
                            id="pref-time-afternoon"
                            active={ preferences.timePreference === 'afternoon' }
                            onClick={ () => setTimePreference( 'afternoon' ) }
                        >
                            🌆 Tarde
                        </Toggle>

                        <Toggle
                            id="pref-time-any"
                            active={ preferences.timePreference === 'any' }
                            onClick={ () => setTimePreference( 'any' ) }
                        >
                            ↔ Indiferente
                        </Toggle>
                    </div>
                </div>

                {/* Distribución */}
                <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Distribución de días
                    </p>

                    <div className="flex gap-1.5">
                        <Toggle
                            id="pref-dist-concentrate"
                            active={ preferences.distribution === 'concentrate' }
                            onClick={ () => setDistribution( 'concentrate' ) }
                        >
                            🎯 Concentrar
                        </Toggle>

                        <Toggle
                            id="pref-dist-spread"
                            active={ preferences.distribution === 'spread' }
                            onClick={ () => setDistribution( 'spread' ) }
                        >
                            📅 Distribuir
                        </Toggle>
                    </div>
                </div>

                {/* Días libres */}
                <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Prefiero libre
                    </p>

                    <div className="flex gap-1">
                        { DAYS.map( ( day ) => (
                            <DayCheckbox
                                key={ day }
                                day={ day }
                                checked={ preferences.freeDays.includes( day ) }
                                onToggle={ toggleFreeDay }
                            />
                        ) ) }
                    </div>
                </div>

                {/* CTA */}
                <Button
                    id="btn-generate-proposals"
                    disabled={ isGenerating }
                    onClick={ onGenerate }
                    className="h-9 px-4 font-semibold gap-2 ml-auto self-end shrink-0"
                >
                    { isGenerating ? (
                        <>
                            <span className="size-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                            Generando propuestas...
                        </>
                    ) : (
                        <>
                            <Sparkles className="size-3.5" />
                            Generar Propuestas
                        </>
                    ) }
                </Button>
            </div>
        </div>
    );
}
