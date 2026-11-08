export type Answer = {
    language?: 'en' | 'es' | 'ca';
    kind: 'rank' | 'tie' | 'unsure' | 'single' | 'multi' | 'text' | 'scale';
    order?: string[];
    value?: string;
    values?: string[];
};
export type Question = {
    id: string;
    type: 'rank' | 'single' | 'multi' | 'text' | 'scale';
    title: string;
    description: string;
    direction?: string;
    required: boolean;
    audio: boolean;
    translations?: Partial<Record<'es' | 'ca', { title: string; description: string; direction?: string; options?: Record<string, string> }>>;
    options?: {
        id: string;
        label: string;
    }[];
};
export type Protocol = {
    id: string;
    title: string;
    demo: boolean;
    questions: Question[];
    minSecondsPerVersion?: number;
};
export type Timing = {
    firstSeenAt: string;
    lastAnsweredAt: string | null;
    activeMs: number;
    elapsedMs: number;
    changes: number;
};
export type Session = {
    id: string;
    language?: 'en' | 'es' | 'ca';
    consentLanguage?: 'en' | 'es' | 'ca';
    protocol: string;
    demo: boolean;
    createdAt: string;
    stimulus: string;
    mapping: string[];
    answers: Record<string, Answer>;
    profile: Record<string, string | boolean>;
    events: {
        type: string;
        at: string;
        question: string | null;
        position?: number;
        index?: number;
    }[];
    listened: Record<string, number>;
    unlocked: number;
    step: number;
    completed: boolean;
    withdrawalKey: string;
    timings: Record<string, Timing>;
    sourceHashes?: string[];
    reasons?: string[];
    genre?: string;
};
