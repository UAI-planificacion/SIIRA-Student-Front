import type { Day } from '@/types/siira';

// ─── Block numbers ────────────────────────────────────────────────────────────

export const BLOCKS = [ 1, 2, 3, 4, 5, 6, 7, 8 ] as const;

export type Block = ( typeof BLOCKS )[ number ];

// ─── Labels ───────────────────────────────────────────────────────────────────

export const BLOCK_LABELS: Record<number, string> = {
    1 : '07:30',
    2 : '08:50',
    3 : '10:10',
    4 : '11:30',
    5 : '12:50',
    6 : '14:10',
    7 : '15:30',
    8 : '16:50',
};

export const DAYS: Day[] = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
];

export const DAY_ABBR: Record<Day, string> = {
    'Lunes'     : 'Lu',
    'Martes'    : 'Ma',
    'Miércoles' : 'Mi',
    'Jueves'    : 'Ju',
    'Viernes'   : 'Vi',
    'Sábado'    : 'Sá',
};

// ─── Slot key ─────────────────────────────────────────────────────────────────

export type SlotKey = `${ Day }-${ number }`;

export function makeSlotKey( day: Day, block: number ): SlotKey {
    return `${ day }-${ block }` as SlotKey;
}
