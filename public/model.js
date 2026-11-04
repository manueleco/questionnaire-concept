export const LABELS = ['A', 'B', 'C'];
export const METRICS = ['loudness', 'clarity', 'harshness', 'emotion'];
export function shuffle(items, random = Math.random) { const a = [...items]; for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
} return a; }
export function newSession() { return { id: crypto.randomUUID(), protocol: 'between-demo-1', demo: true, createdAt: new Date().toISOString(), stimulus: 'synthetic-loop-v1', mapping: shuffle(['low', 'medium', 'high']), answers: {}, profile: {}, events: [], listened: { A: 0, B: 0, C: 0 }, unlocked: 0, step: 0, completed: false }; }
export function validAnswer(a) { return !!a && (['tie', 'unsure'].includes(a.kind) || (a.kind === 'rank' && a.order?.length === 3 && new Set(a.order).size === 3 && a.order.every(v => LABELS.includes(v)))); }
export function listenedAll(s) { return LABELS.every(k => s.listened[k] >= 1.2); }
export function toggleRank(a, label) { if (a?.kind !== 'rank')
    a = { kind: 'rank', order: [] }; return { ...a, order: a.order.includes(label) ? a.order.filter(x => x !== label) : [...a.order, label] }; }
export function csvCell(x) { let s = String(x ?? ''); if (/^[=+@\-\t\r]/.test(s))
    s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; }
export function toCsv(s) { const header = ['session_id', 'protocol', 'demo', 'stimulus', 'metric', 'kind', 'rank_1', 'rank_2', 'rank_3', 'A_condition', 'B_condition', 'C_condition', 'headphones', 'background', 'reason', 'genre']; const rows = METRICS.map(m => { const a = s.answers[m] || {}; return [s.id, s.protocol, true, s.stimulus, m, a.kind, ...[0, 1, 2].map(i => a.order?.[i] || ''), ...s.mapping, s.profile.headphones, s.profile.background, (s.reasons || []).join('; '), s.genre || '']; }); return [header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n'); }
