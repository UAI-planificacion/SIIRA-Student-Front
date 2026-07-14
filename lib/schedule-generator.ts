import type { Day, ScheduleSlot, Subject } from '@/types/siira';

// ─── Public types ─────────────────────────────────────────────────────────────

export type TimePreference  = 'morning' | 'afternoon' | 'any';
export type DayDistribution = 'concentrate' | 'spread';
export type ProposalKind    = 'morning' | 'concentrated' | 'balanced';

export interface SchedulePreferences {
    timePreference : TimePreference;
    distribution   : DayDistribution;
    freeDays       : Day[];
}

export interface ScheduleProposal {
    id           : ProposalKind;
    label        : string;
    subtitle     : string;
    emoji        : string;
    subjects     : Subject[];
    totalCredits : number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SUBJECTS = 5;
const MAX_CREDITS  = 30;

const PROFILE_META: Record<ProposalKind, { label: string; subtitle: string; emoji: string }> = {
    morning      : {
        label    : 'Concentrado en la Mañana',
        subtitle : 'Prioriza bloques tempranos (07:30 – 11:30)',
        emoji    : '🌅',
    },
    concentrated : {
        label    : 'Máxima Concentración',
        subtitle : 'Minimiza los días con clases en la semana',
        emoji    : '🎯',
    },
    balanced     : {
        label    : 'Distribución Equilibrada',
        subtitle : 'Reparte los ramos de forma uniforme en la semana',
        emoji    : '⚖️',
    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSchedule( raw: string ): ScheduleSlot[] {
    try {
        return JSON.parse( raw ) as ScheduleSlot[];
    } catch {
        return [];
    }
}

function hasConflict( subject: Subject, selected: Subject[] ): boolean {
    const newSlots = parseSchedule( subject.schedule );

    return selected.some( ( sel ) => {
        const selSlots = parseSchedule( sel.schedule );

        return newSlots.some( ( ns ) =>
            selSlots.some( ( ss ) => ss.day === ns.day && ss.block === ns.block )
        );
    } );
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreForProfile(
    subject     : Subject,
    slots       : ScheduleSlot[],
    profile     : ProposalKind,
    preferences : SchedulePreferences,
    selected    : Subject[],
): number {
    let score = 0;

    // Base: required subjects always win
    score += subject.isRequired ? 200 : 0;

    // Quota bonus
    score += subject.quotas > 10 ? 20 : subject.quotas > 0 ? 10 : 0;

    // Penalize free days — hard constraint simulation
    const freeDayHits = slots.filter( ( s ) => preferences.freeDays.includes( s.day ) ).length;
    score -= freeDayHits * 80;

    // Derived metrics
    const morningSlots   = slots.filter( ( s ) => s.block <= 4 ).length;
    const afternoonSlots = slots.filter( ( s ) => s.block >= 5 ).length;
    const uniqueDays     = new Set( slots.map( ( s ) => s.day ) ).size;
    const currentDays    = new Set( selected.flatMap( ( s ) => parseSchedule( s.schedule ).map( ( sl ) => sl.day ) ) );
    const newDays        = [ ...new Set( slots.map( ( s ) => s.day ) ) ].filter( ( d ) => !currentDays.has( d ) ).length;

    if ( profile === 'morning' ) {
        score += morningSlots * 35;
        score -= afternoonSlots * 20;

        if ( preferences.timePreference === 'morning' )   score += morningSlots * 20;
        if ( preferences.timePreference === 'afternoon' ) score += afternoonSlots * 20;
    }

    if ( profile === 'concentrated' ) {
        // Fewer unique days = better
        score -= uniqueDays * 30;
        // Avoid adding brand-new days (prefer sharing existing days)
        score -= newDays * 25;

        if ( preferences.timePreference === 'morning' )   score += morningSlots * 15;
        if ( preferences.timePreference === 'afternoon' ) score += afternoonSlots * 15;
        if ( preferences.distribution === 'concentrate' ) score += ( 6 - uniqueDays ) * 15;
    }

    if ( profile === 'balanced' ) {
        // Reward adding variety (new days not yet covered)
        score += newDays * 25;
        // Higher credits = more educational value per slot
        score += subject.credits * 5;

        if ( preferences.timePreference === 'morning' )   score += morningSlots * 10;
        if ( preferences.timePreference === 'afternoon' ) score += afternoonSlots * 10;
        if ( preferences.distribution === 'spread' )      score += newDays * 15;
        if ( preferences.distribution === 'concentrate' ) score -= newDays * 10;
    }

    return score;
}

// ─── Greedy builder ───────────────────────────────────────────────────────────

function buildProposal(
    candidates  : Subject[],
    profile     : ProposalKind,
    preferences : SchedulePreferences,
): ScheduleProposal {
    const remaining  = [ ...candidates ];
    const selected   : Subject[] = [];
    let   totalCredits = 0;

    while ( selected.length < MAX_SUBJECTS && remaining.length > 0 ) {
        let bestIdx   = -1;
        let bestScore = -Infinity;

        for ( let i = 0; i < remaining.length; i++ ) {
            const subject = remaining[ i ]!;

            if ( totalCredits + subject.credits > MAX_CREDITS ) continue;
            if ( hasConflict( subject, selected ) ) continue;

            const slots = parseSchedule( subject.schedule );
            const score = scoreForProfile( subject, slots, profile, preferences, selected );

            if ( score > bestScore ) {
                bestScore = score;
                bestIdx   = i;
            }
        }

        if ( bestIdx === -1 ) break;

        const [ chosen ] = remaining.splice( bestIdx, 1 );

        selected.push( chosen! );
        totalCredits += chosen!.credits;
    }

    const meta = PROFILE_META[ profile ];

    return {
        id           : profile,
        label        : meta.label,
        subtitle     : meta.subtitle,
        emoji        : meta.emoji,
        subjects     : selected,
        totalCredits,
    };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateProposals(
    subjects    : Subject[],
    preferences : SchedulePreferences,
): ScheduleProposal[] {
    const candidates = subjects.filter(
        ( s ) => s.academicStatus === 'available_to_enroll' && s.quotas > 0
    );

    return [
        buildProposal( candidates, 'morning',      preferences ),
        buildProposal( candidates, 'concentrated', preferences ),
        buildProposal( candidates, 'balanced',     preferences ),
    ];
}
