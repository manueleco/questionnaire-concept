import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ComparisonAudio } from '../public/audio.js';
import { newSession, validAnswer, toggleRank, LABELS, csvCell } from '../public/model.js';
import { saveAudio, loadAudio, clearAudio } from './audio-storage';
import type { Session, Question, Protocol, Answer, Timing } from './types';
const STORAGE = 'scroll-questionnaire-demo-v1';
const fresh = (): Session => ({ ...newSession(), withdrawalKey: crypto.randomUUID() + crypto.randomUUID(), timings: {} } as Session);
function readSession() { try {
    const s = JSON.parse(localStorage.getItem(STORAGE) || 'null');
    if (Date.now() - Date.parse(s?.createdAt) < 90 * 86400000 && s?.protocol && s?.id && s?.withdrawalKey && Array.isArray(s.mapping) && s.mapping.length === 3 && s.timings && s.answers && s.profile && s.listened && ['synthetic-loop-v1', 'local-import', 'supplied-augments'].includes(s.stimulus))
        return s as Session;
}
catch { } return fresh(); }
function notify(message: string) { const el = document.querySelector('#toast')!; el.textContent = message; el.classList.add('visible'); setTimeout(() => el.classList.remove('visible'), 4000); }
const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
function App() {
    const [protocol, setProtocol] = useState<Protocol | null>(null), [session, setSession] = useState<Session>(readSession), [step, setStep] = useState(0), [audioState, setAudioState] = useState({ playing: false, selected: 0, position: 0 }), [busy, setBusy] = useState(false), [mode, setMode] = useState<'local' | 'database'>('local'), [status, setStatus] = useState('Saved on this device'), [error, setError] = useState(''), [receipt, setReceipt] = useState(false);
    const progressDialog = useRef<HTMLDialogElement>(null);
    const state = useRef(session), current = useRef(step), timings = useRef<Record<string, Timing>>(session.timings), csrf = useRef(''), backendProtocol = useRef(''), lastTick = useRef(performance.now()), lastStore = useRef(0), feed = document.querySelector('#feed')!;
    state.current = session;
    current.current = step;
    const audio = useRef<ComparisonAudio | null>(null);
    if (!audio.current)
        audio.current = new ComparisonAudio((type: string, data: Record<string, number>) => { const s = state.current; const q = protocolRef.current?.questions[current.current - 2]; s.events.push({ type, at: new Date().toISOString(), question: q?.id || null, ...data }); s.events = s.events.slice(-500); });
    const protocolRef = useRef<Protocol | null>(protocol);
    protocolRef.current = protocol;
    function persist(s: Session) { s.timings = timings.current; try {
        localStorage.setItem(STORAGE, JSON.stringify(s));
    }
    catch {
        setStatus('Device storage unavailable — export before leaving');
    } }
    function update(next: Session) { state.current = next; setSession({ ...next }); persist(next); }
    function go(index: number) { const max = state.current.unlocked; if (index > max) {
        notify('Complete this step first, then scroll down.');
        return;
    } const target = document.querySelector<HTMLElement>(`[data-page="${Math.max(0, index)}"]`); if (target) {
        // Scroll only the feed, never the document. Long cards have their own readable scroll area.
        const card = target.querySelector('.card'); if (card) card.scrollTop = 0;
        feed.scrollTo({ top: feed.scrollTop + target.getBoundingClientRect().top - feed.getBoundingClientRect().top, behavior: motion() });
    } }
    const total = (protocol?.questions.length || 6) + 3;
    useEffect(() => { let cancelled = false; (async () => { let p: Protocol; try {
        const wanted = new URLSearchParams(location.search).get('protocol');
        const boot = await fetch('/api/bootstrap/', { credentials: 'same-origin' });
        if (!boot.ok)
            throw Error();
        const data = await boot.json();
        csrf.current = data.csrf;
        const r = await fetch(wanted ? `/api/protocol/${encodeURIComponent(wanted)}/` : '/api/protocol/');
        if (!r.ok)
            throw Error('protocol');
        p = await r.json();
        backendProtocol.current = p.id;
        if (!cancelled)
            setMode('database');
    }
    catch {
        const r = await fetch('/questions.json');
        p = await r.json();
    } if (cancelled)
        return; const resume = state.current.step; setProtocol(p); if (state.current.protocol !== p.id) {
        const s = fresh();
        s.protocol = p.id;
        timings.current = {};
        update(s);
    }
    else {
        if (state.current.completed)
            setReceipt(true);
        setTimeout(() => go(resume), 100);
    } })(); return () => { cancelled = true; }; }, []);
    useEffect(() => { document.querySelector('#save-status')!.textContent = status; }, [status]);
    useEffect(() => { document.querySelector('#privacy-info')!.textContent = mode === 'database' ? 'When you submit, this demo stores your answers in this server’s database. Your browser keeps a draft and a private withdrawal key. No email or name is collected.' : 'This hosted preview stores answers only in this browser. Nothing is submitted to a research database. You can download or erase your demo session.'; setStatus(mode === 'database' ? 'Draft on device · submit to save to database' : 'Demo · saved on this device'); }, [mode]);
    useEffect(() => { if (!protocol)
        return; let previous = -1; const onScroll = () => { const root = feed.getBoundingClientRect(); const marker = root.top + Math.min(180, root.height * .35); const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-page]:not([hidden])')); const node = nodes.find(n => { const r = n.getBoundingClientRect(); return r.top <= marker && r.bottom > marker; }) || nodes[0]; if (!node)
        return; const i = Number(node.dataset.page); (document.querySelector('#next') as HTMLButtonElement).disabled = i >= state.current.unlocked; if (i === previous)
        return; previous = i; setStep(i); state.current.step = i; if (!protocol.questions[i - 2]?.audio)
        audio.current?.pause(); document.querySelectorAll<HTMLButtonElement>('.mobile-nav [data-nav]').forEach(b => {
        if (b.dataset.nav === (i === 0 ? 'home' : 'listen')) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    (document.querySelector('#previous') as HTMLButtonElement).disabled = i === 0;
    (document.querySelector('#next') as HTMLButtonElement).disabled = i >= state.current.unlocked;
    const meter = document.querySelector<HTMLProgressElement>('#journey-progress')!; meter.max = total; meter.value = i + 1;
    document.querySelector('#step-number')!.textContent = String(i + 1).padStart(2, '0'); document.querySelector('.progress-rail > span:last-child')!.textContent = String(total).padStart(2, '0'); (document.querySelector('#rail-fill') as HTMLElement).style.height = `${(i + 1) / total * 100}%`; document.querySelector('#bottom-hint')!.textContent = i === 0 ? 'Make yourself comfortable' : i === total - 1 ? 'Thanks for listening' : 'Answer, then scroll to continue'; document.querySelectorAll('.journey button').forEach((b, k) => b.classList.toggle('active', k === (i < 2 ? 0 : i < 6 ? 1 : i < total - 1 ? 2 : 3))); }; feed.addEventListener('scroll', onScroll, { passive: true }); onScroll(); return () => feed.removeEventListener('scroll', onScroll); }, [protocol, session.unlocked, total]);
    useEffect(() => {
        const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-nav]'));
        const handlers = buttons.map(button => {
            const handler = () => {
                if (button.dataset.nav === 'home') go(0);
                if (button.dataset.nav === 'listen') go(Math.min(state.current.unlocked, Math.max(2, current.current)));
                if (button.dataset.nav === 'info') (document.querySelector('#about') as HTMLButtonElement).click();
                if (button.dataset.nav === 'progress') { audio.current?.pause(); progressDialog.current?.showModal(); }
            };
            button.addEventListener('click', handler); return handler;
        });
        return () => buttons.forEach((button, i) => button.removeEventListener('click', handlers[i]));
    }, []);
    useEffect(() => { const prev = () => go(current.current - 1), next = () => go(current.current + 1); document.querySelector('#previous')!.addEventListener('click', prev); document.querySelector('#next')!.addEventListener('click', next); const nav = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-step]')); const handlers = nav.map((el, i) => { const fn = () => go([0, 2, Math.min(6, total - 2), total - 1][i]); el.addEventListener('click', fn); return fn; }); const key = (e: KeyboardEvent) => { if (document.querySelector('dialog[open]') || /INPUT|SELECT|TEXTAREA|BUTTON/.test((e.target as HTMLElement).tagName))
        return;
        // Let keyboard users read a long card before moving between steps.
        const activeCard = (e.target as HTMLElement).closest<HTMLElement>('.card');
        if (activeCard) {
            const down = ['ArrowDown', 'PageDown'].includes(e.key);
            const up = ['ArrowUp', 'PageUp'].includes(e.key);
            if ((down && activeCard.scrollTop + activeCard.clientHeight < activeCard.scrollHeight - 2) || (up && activeCard.scrollTop > 2)) {
                e.preventDefault();
                activeCard.scrollBy({ top: (down ? 1 : -1) * (e.key.startsWith('Page') ? activeCard.clientHeight * .85 : 40), behavior: motion() });
                return;
            }
        }
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        next();
    } if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
    } if (['1', '2', '3'].includes(e.key) && protocolRef.current?.questions[current.current - 2]?.audio) {
        e.preventDefault();
        switchAudio(Number(e.key) - 1);
    } if (e.code === 'Space' && protocolRef.current?.questions[current.current - 2]?.audio) {
        e.preventDefault();
        togglePlay();
    } }; document.addEventListener('keydown', key); return () => { document.querySelector('#previous')!.removeEventListener('click', prev); document.querySelector('#next')!.removeEventListener('click', next); nav.forEach((n, i) => n.removeEventListener('click', handlers[i])); document.removeEventListener('keydown', key); }; }, [total]);
    useEffect(() => { const interval = setInterval(() => { const now = performance.now(), dt = Math.min(1000, now - lastTick.current); lastTick.current = now; const q = protocolRef.current?.questions[current.current - 2], a = audio.current!, s = state.current; if (!document.hidden && !document.querySelector('dialog[open]') && q && !s.completed) {
        const t = timings.current[q.id] ??= { firstSeenAt: new Date().toISOString(), lastAnsweredAt: null, activeMs: 0, elapsedMs: 0, changes: 0 };
        t.activeMs += dt;
        if (a.playing && a.ctx?.state === 'running' && q.audio)
            s.listened[LABELS[s.mapping.indexOf((s.stimulus !== 'synthetic-loop-v1' ? ['source-1', 'source-2', 'source-3'] : ['low', 'medium', 'high'])[a.selected])]] = Math.min(3600, (s.listened[LABELS[s.mapping.indexOf((s.stimulus !== 'synthetic-loop-v1' ? ['source-1', 'source-2', 'source-3'] : ['low', 'medium', 'high'])[a.selected])]] || 0) + dt / 1000);
    } setAudioState({ playing: a.playing, selected: a.selected, position: Math.max(0, a.position) }); if (now - lastStore.current > 2000) {
        persist(s);
        lastStore.current = now;
    } }, 150); const hide = () => { if (document.hidden)
        audio.current?.pause(); lastTick.current = performance.now(); persist(state.current); }; document.addEventListener('visibilitychange', hide); window.addEventListener('pagehide', hide); return () => { clearInterval(interval); document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', hide); }; }, []);
    async function togglePlay() { try {
        setBusy(true);
        if (audio.current!.playing)
            audio.current!.pause();
        else {
            if (state.current.stimulus !== 'synthetic-loop-v1' && !audio.current!.buffers) {
                const files = await loadAudio(state.current.id);
                if (!files)
                    throw Error('Audio files are no longer on this device. Export your answers, then reload the files through About the demo.');
                await audio.current!.import(files);
            }
            await audio.current!.init();
            await audio.current!.play();
        }
        setError('');
    }
    catch (e) {
        setError((e as Error).message || 'Audio could not start. Check your browser audio settings and try again.');
    }
    finally {
        setBusy(false);
    } }
    // Audio engine uses buffer indices; UI always keeps randomized A/B/C labels.
    function switchAudio(labelIndex: number) { const idx = (state.current.stimulus !== 'synthetic-loop-v1' ? ['source-1', 'source-2', 'source-3'] : ['low', 'medium', 'high']).indexOf(state.current.mapping[labelIndex]); audio.current!.select(idx); }
    const selectedLabel = () => Math.max(0, session.mapping.indexOf((session.stimulus !== 'synthetic-loop-v1' ? ['source-1', 'source-2', 'source-3'] : ['low', 'medium', 'high'])[audioState.selected]));
    function answer(q: Question, value: Answer, index: number) { if (state.current.completed)
        return; const now = new Date(); const t = timings.current[q.id] ??= { firstSeenAt: now.toISOString(), lastAnsweredAt: null, activeMs: 0, elapsedMs: 0, changes: 0 }; t.lastAnsweredAt = now.toISOString(); t.elapsedMs = now.getTime() - Date.parse(t.firstSeenAt); t.changes++; const s = { ...state.current, answers: { ...state.current.answers, [q.id]: value } }; if (isValid(q, value) && (!q.audio || allHeard()))
        s.unlocked = Math.max(s.unlocked, index + 1); update(s); setError(''); }
    function allHeard() { return LABELS.every(l => state.current.listened[l] >= 1.2); }
    function isValid(q: Question, a?: Answer) { if (!q.required && !a)
        return true; if (!a)
        return false; if (q.type === 'rank')
        return validAnswer(a); if (q.type === 'multi')
        return !q.required || !!a.values?.length; return !q.required || !!a.value?.trim(); }
    function advance(q: Question, index: number) { if (q.audio && !allHeard()) {
        setError('Listen to A, B and C for at least a moment each before continuing.');
        return;
    } if (!isValid(q, state.current.answers[q.id])) {
        setError('Finish your answer, or choose “Cannot judge”.');
        return;
    } update({ ...state.current, unlocked: Math.max(state.current.unlocked, index + 1) }); setError(''); setTimeout(() => go(index + 1), 20); }
    function download(format: 'json' | 'csv') { const s = { ...state.current, timings: timings.current }; let contents = JSON.stringify(s, null, 2); if (format === 'csv') {
        const headers = ['session_id', 'question_id', 'kind', 'answer', 'active_ms', 'elapsed_to_last_answer_ms', 'first_seen_at', 'last_answered_at'];
        const rows = Object.entries(s.answers).map(([id, a]) => [s.id, id, a.kind, JSON.stringify(a.order || a.values || a.value || ''), s.timings[id]?.activeMs, s.timings[id]?.elapsedMs, s.timings[id]?.firstSeenAt, s.timings[id]?.lastAnsweredAt]);
        contents = [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n');
    } const url = URL.createObjectURL(new Blob([contents], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8' })); const el = document.createElement('a'); el.href = url; el.download = `scroll-questionnaire-${s.id}.${format}`; el.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    async function submit() { if (!protocol || busy)
        return; const invalid = protocol.questions.findIndex(q => !isValid(q, state.current.answers[q.id]) || (q.audio && !allHeard())); if (invalid >= 0) {
        go(invalid + 2);
        setError('Please complete this question and listen to all three versions.');
        return;
    } setBusy(true); setError(''); audio.current?.pause(); const s = { ...state.current, timings: timings.current }; try {
        if (mode === 'database') {
            const r = await fetch('/api/responses/', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf.current }, body: JSON.stringify(s) });
            if (!r.ok)
                throw Error('Your answers are still on this device. The server could not save them; retry or download a copy.');
        }
        update({ ...s, completed: true });
        setReceipt(true);
        setStatus(mode === 'database' ? '✓ Saved to database' : '✓ Demo completed · stored on this device');
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    async function erase() { if (!confirm('Erase this demo session and its saved responses?'))
        return; setBusy(true); try {
        if (mode === 'database' && state.current.completed) {
            const r = await fetch('/api/responses/', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf.current }, body: JSON.stringify({ id: state.current.id, withdrawalKey: state.current.withdrawalKey }) });
            if (!r.ok)
                throw Error('The server could not erase your session. Keep your withdrawal key and try again.');
        }
        audio.current?.pause();
        audio.current!.buffers = null;
        audio.current!.offset = 0;
        audio.current!.selected = 0;
        await clearAudio();
        localStorage.removeItem(STORAGE);
        const s = fresh();
        s.protocol = protocol!.id;
        timings.current = {};
        update(s);
        setReceipt(false);
        setError('');
        setTimeout(() => go(0), 20);
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    useEffect(() => {
        const about = document.querySelector('#about')!, dialog = document.querySelector<HTMLDialogElement>('#info')!, imp = document.querySelector<HTMLDialogElement>('#import-dialog')!;
        const open = () => { audio.current?.pause(); dialog.showModal(); };
        about.addEventListener('click', open);
        const closeFns = Array.from(document.querySelectorAll('.close')).map(b => { const f = () => b.closest('dialog')?.close(); b.addEventListener('click', f); return { b, f }; });
        const importOpen = () => { dialog.close(); imp.showModal(); };
        document.querySelector('#open-import')!.addEventListener('click', importOpen);
        const form = document.querySelector<HTMLFormElement>('#import-form')!;
        const load = async (e: Event) => { e.preventDefault(); const btn = form.querySelector('button')!; btn.disabled = true; try {
            const files = Array.from(form.querySelectorAll<HTMLInputElement>('input')).map(i => i.files![0]);
            await audio.current!.import(files);
            const s = fresh();
            s.protocol = protocolRef.current!.id;
            s.stimulus = 'local-import';
            s.sourceHashes = await Promise.all(files.map(async (f) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await f.arrayBuffer()))).map(b => b.toString(16).padStart(2, '0')).join('')));
            s.mapping = s.mapping.map(v => ({ 'low': 'source-1', 'medium': 'source-2', 'high': 'source-3' }[v] || v));
            await saveAudio(s.id, files);
            timings.current = {};
            update(s);
            setReceipt(false);
            imp.close();
            notify('Files loaded locally. A/B/C labels have been shuffled.');
            setTimeout(() => go(0), 20);
        }
        catch (e) {
            document.querySelector('#import-error')!.textContent = (e as Error).message;
        }
        finally {
            btn.disabled = false;
        } };
        form.addEventListener('submit', load);
        const sampleForm = document.querySelector<HTMLFormElement>('#sample-form')!;
        const sampleLoad = async (e: Event) => { e.preventDefault(); const button = sampleForm.querySelector('button')!; button.disabled = true; try {
            const keys = Array.from(sampleForm.querySelectorAll<HTMLSelectElement>('select')).map(s => s.value);
            if (new Set(keys).size !== 3)
                throw Error('Choose three different versions.');
            const files = await Promise.all(keys.map(async (k) => { const r = await fetch('/api/demo-assets/' + encodeURIComponent(k) + '/'); if (!r.ok)
                throw Error('Sample could not be loaded.'); return new File([await r.blob()], k + '.wav', { type: 'audio/wav' }); }));
            await audio.current!.import(files);
            const s = fresh();
            s.protocol = protocolRef.current!.id;
            s.stimulus = 'supplied-augments';
            s.sourceHashes = await Promise.all(files.map(async (f) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await f.arrayBuffer()))).map(b => b.toString(16).padStart(2, '0')).join('')));
            s.mapping = s.mapping.map(v => ({ 'low': 'source-1', 'medium': 'source-2', 'high': 'source-3' }[v] || v));
            await saveAudio(s.id, files);
            timings.current = {};
            update(s);
            setReceipt(false);
            dialog.close();
            notify('Your supplied audio is ready. This comparison uses different effects, not saturation levels.');
            setTimeout(() => go(0), 20);
        }
        catch (e) {
            document.querySelector('#sample-error')!.textContent = (e as Error).message;
        }
        finally {
            button.disabled = false;
        } };
        sampleForm.addEventListener('submit', sampleLoad);
        fetch('/api/demo-assets/').then(r => r.ok ? r.json() : null).then(data => { if (!data?.assets?.length)
            return; sampleForm.hidden = false; sampleForm.querySelectorAll('select').forEach((select, i) => { data.assets.forEach((a: {
            id: string;
            label: string;
        }) => { const option = document.createElement('option'); option.value = a.id; option.textContent = a.label; select.append(option); }); select.selectedIndex = i; }); }).catch(() => { });
        return () => { about.removeEventListener('click', open); closeFns.forEach(({ b, f }) => b.removeEventListener('click', f)); document.querySelector('#open-import')!.removeEventListener('click', importOpen); form.removeEventListener('submit', load); sampleForm.removeEventListener('submit', sampleLoad); };
    }, []);
    if (!protocol)
        return <section className="page"><div className="card"><h2>Preparing your session…</h2></div></section>;
    const page = (i: number, content: React.ReactNode, cls = '') => <section key={i} data-page={i} hidden={i > session.unlocked} className={`page ${cls}`}><div className="card" tabIndex={0} role="region" aria-label={`Step ${i + 1} of ${total}`}>{content}</div><div className="under-card">{i === 0 ? 'Headphones on. Everything else can wait.' : i === total - 1 ? 'A small contribution to understanding sound.' : 'Your response stays selected when you scroll.'}</div></section>;
    const head = (i: number, label: string) => <div className="card-head"><span className="pill">{label}</span><span className="step-counter">{String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span></div>;
    function player() { const selected = selectedLabel(); return <div className="player"><div className="player-top"><span>{session.stimulus !== 'synthetic-loop-v1' ? 'Your local excerpt' : 'Original demo loop'}</span><span>{Math.round(audio.current!.duration)} SEC · LOOP</span></div><div className="audio-buttons">{LABELS.map((l, i) => <button className="version" key={l} aria-pressed={selected === i} aria-label={`Listen to version ${l}${session.listened[l] >= 1.2 ? ', heard' : ''}`} onClick={() => switchAudio(i)}>{l}<span className="heard">{session.listened[l] >= 1.2 ? '✓' : ''}</span></button>)}</div><div className="transport"><button className="play" aria-label={audioState.playing ? 'Pause audio' : 'Play audio'} disabled={busy} onClick={togglePlay}>{busy ? '…' : audioState.playing ? 'Ⅱ' : '▶'}</button><div className="waveform" aria-hidden="true">{Array.from({ length: 42 }, (_, i) => <i key={i} className={i / 42 < audioState.position / audio.current!.duration ? 'passed' : ''} style={{ height: `${8 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * .31)) * 30}px` }}/>)}</div><span className="time">0:{String(Math.floor(audioState.position)).padStart(2, '0')}</span></div><div className="player-caption">Switch A / B / C while the music keeps playing.</div></div>; }
    return <>
 {page(0, <>{head(0, 'An experiment in listening')}<div className="listening-banner" aria-hidden="true"><span className="banner-label">ONE TRACK. THREE PERSPECTIVES.</span><div className="listening-wave">{Array.from({length: 35}, (_, i) => <i key={i} style={{height: `${12 + Math.abs(Math.sin(i * .66) * Math.cos(i * .17)) * 52}px`}} />)}</div><div className="banner-letters"><span>A</span><span>B</span><span>C</span></div></div><h2>Listen closer.<br />Feel the difference.</h2><p>Explore three versions of the same music.<br />Listen, compare, and tell us what you notice.</p><div className="meta-row"><span>◷ At your own pace</span><span>◉ Headphones required</span></div><button className="primary wide" onClick={() => { update({ ...state.current, unlocked: Math.max(1, state.current.unlocked) }); setTimeout(() => go(1), 20); }}>Let's listen <span aria-hidden="true">→</span></button><p className="subtle-note">Demo audio · {protocol.questions.length} questions · no right or wrong answers</p></>, 'welcome')}
 {page(1, <>{head(1, 'Settle in')}<h2>Find your listening space.</h2><p>Use headphones in a quiet place. Start at a low, comfortable volume, then keep it unchanged. Stop if listening feels uncomfortable.</p><form onSubmit={e => { e.preventDefault(); if (session.completed) {
        go(2);
        return;
    } update({ ...state.current, unlocked: Math.max(2, state.current.unlocked), profile: { ...state.current.profile, consent: true, consentAt: new Date().toISOString() } }); setTimeout(() => go(2), 20); }}><div className="field-grid"><label>Headphones<select aria-label="Headphones" required value={String(session.profile.headphones || '')} onChange={e => update({ ...state.current, profile: { ...state.current.profile, headphones: e.target.value } })} disabled={session.completed}><option value="">Choose type</option><option value="in-ear">In-ear</option><option value="over-ear">Over-ear</option><option value="on-ear">On-ear</option></select></label><label>Musical background<select aria-label="Musical background" required value={String(session.profile.background || '')} onChange={e => update({ ...state.current, profile: { ...state.current.profile, background: e.target.value } })} disabled={session.completed}><option value="">Choose background</option><option value="none">No formal background</option><option value="listener">Enthusiastic listener</option><option value="performer">Performer / singer</option><option value="producer">Producer / engineer</option><option value="student">Music student / researcher</option><option value="other">Other / multiple</option></select></label></div><label>Background details (optional)<input type="text" maxLength={200} value={String(session.profile.details || '')} disabled={session.completed} onChange={e => update({ ...state.current, profile: { ...state.current.profile, details: e.target.value } })}/></label><label className="check"><input required type="checkbox" checked={!!session.profile.headphonesConfirmed} disabled={session.completed} onChange={e => update({ ...state.current, profile: { ...state.current.profile, headphonesConfirmed: e.target.checked } })}/><span>I'm wearing headphones and have set a comfortable volume.</span></label><label className="check"><input required type="checkbox" checked={!!session.profile.consent} disabled={session.completed} onChange={e => update({ ...state.current, profile: { ...state.current.profile, consent: e.target.checked } })}/><span>I understand this is a demo. Answers and interaction times are saved {mode === 'database' ? 'to this server when I submit' : 'on this device'}. I can erase them at the end.</span></label><button className="primary wide" type="submit">I'm ready →</button></form></>)}
 {protocol.questions.map((q, j) => { const i = j + 2, a = session.answers[q.id]; return page(i, <>{head(i, q.audio ? 'Listen & compare' : q.required ? 'Your experience' : 'One more thought · optional')}<h2>{q.title}</h2><p>{q.description}</p>{q.audio && player()}<fieldset disabled={session.completed} className="answer-fieldset"><legend className="sr-only">{q.title}</legend>{q.type === 'rank' ? <><p className="ranking-caption">Tap in order: <strong>{q.direction || 'Most → least'}</strong></p><div className="rank-options">{LABELS.map(l => <button key={l} className="rank-choice" aria-pressed={a?.order?.includes(l) || false} onClick={() => answer(q, toggleRank(a, l) as Answer, i)}>{l}<span className="rank-num">{a?.order?.includes(l) ? `${a.order.indexOf(l) + 1}${['st', 'nd', 'rd'][a.order.indexOf(l)]}` : '–'}</span></button>)}</div><div className="alternatives"><button aria-pressed={a?.kind === 'tie'} onClick={() => answer(q, { kind: 'tie' }, i)}>No difference</button><button aria-pressed={a?.kind === 'unsure'} onClick={() => answer(q, { kind: 'unsure' }, i)}>Cannot judge</button><button onClick={() => answer(q, { kind: 'rank', order: [] }, i)}>Reset order</button></div></> : q.type === 'text' ? <label>Your response<textarea maxLength={1000} value={a?.value || ''} onChange={e => answer(q, { kind: 'text', value: e.target.value }, i)}/></label> : q.type === 'scale' ? <label>Choose a rating<select value={a?.value || ''} onChange={e => answer(q, { kind: 'scale', value: e.target.value }, i)}><option value="">Select</option>{[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}</select></label> : <div className="reason-options">{q.options?.map(o => <button key={o.id} aria-pressed={q.type === 'multi' ? a?.values?.includes(o.id) || false : a?.value === o.id} onClick={() => answer(q, q.type === 'multi' ? { kind: 'multi', values: a?.values?.includes(o.id) ? a.values.filter(v => v !== o.id) : [...(a?.values || []), o.id] } : { kind: 'single', value: o.id }, i)}>{o.label}</button>)}</div>}</fieldset><p className={`helper ${error && step === i ? 'error' : ''}`} role={error && step === i ? 'alert' : undefined}>{step === i && error ? error : q.audio ? 'Listen to all three. Tap a selected letter to change your order.' : 'Share only what you want to share.'}</p><div className="continue-row"><span>{q.required ? 'Then scroll ↓' : 'You can skip this question'}</span><button className="primary" onClick={() => advance(q, i)}>{q.required ? 'Continue →' : 'Next →'}</button></div></>); })}
 {page(total - 1, <>{head(total - 1, receipt ? 'Session complete' : 'Ready to finish')}<div className="finish-mark" aria-hidden="true">✓</div><h2>{receipt ? 'Good listening. Thank you.' : 'Your ears did the work.'}</h2><p>{receipt ? 'You explored how small changes in sound can shape an experience. This completion mark celebrates your participation.' : 'Submit your demo responses when you’re ready. You can still scroll back to check them.'}</p><div className="receipt"><div><strong>{protocol.questions.filter(q => session.answers[q.id]).length}</strong>questions answered</div><div><strong>A / B / C</strong>versions explored</div></div><p className="helper error" role="alert">{error && step === total - 1 ? error : ''}</p>{!receipt && <button className="primary wide" disabled={busy} onClick={submit}>{busy ? 'Saving…' : mode === 'database' ? 'Submit demo responses →' : 'Finish demo →'}</button>}{receipt && <p>{mode === 'database' ? '✓ Responses saved in the database.' : '✓ Saved on this device only.'} This is not a hearing test or a personality profile.</p>}<div className="export-row"><button className="secondary" onClick={() => download('csv')}>Download CSV</button><button className="secondary" onClick={() => download('json')}>Download JSON</button><button className="quiet" disabled={busy} onClick={erase}>Erase my session</button></div><p className="subtle-note">JSON includes your private withdrawal key. Keep it private.</p></>)}
 <dialog id="progress-dialog" ref={progressDialog} aria-labelledby="progress-title">
    <button className="close quiet" aria-label="Close progress" onClick={() => progressDialog.current?.close()}>×</button>
    <p className="eyebrow">YOUR SESSION</p><h2 id="progress-title">A little progress.</h2>
    <p>{protocol.questions.filter(q => isValid(q, session.answers[q.id]) && !!session.answers[q.id]).length} of {protocol.questions.length} questions answered. Take all the time you need.</p>
    <ol className="progress-list">{[{ title: 'Welcome', index: 0 }, { title: 'Your listening setup', index: 1 }, ...protocol.questions.map((q, j) => ({ title: q.title, index: j + 2 })), { title: 'Review & finish', index: total - 1 }].map(item => <li key={item.index}><button disabled={item.index > session.unlocked} onClick={() => { progressDialog.current?.close(); go(item.index); }}><span className="progress-index">{String(item.index + 1).padStart(2, '0')}</span><span>{item.title}</span><span aria-hidden="true">{item.index > session.unlocked ? '—' : '↗'}</span></button></li>)}</ol>
    <p className="helper">Complete the current step to unlock the next one. You can return to earlier answers.</p>
 </dialog>
 </>;
}
createRoot(document.getElementById('feed')!).render(<App />);
