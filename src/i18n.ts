import { messages } from './locales';
import type { Question } from './types';
export const LANGUAGES = { en: 'English', es: 'Español', ca: 'Català' } as const;
export type Language = keyof typeof LANGUAGES;
export const isLanguage = (value: unknown): value is Language => typeof value === 'string' && Object.hasOwn(LANGUAGES, value);
const STORAGE = 'scroll-questionnaire-language';
export function initialLanguage(): Language {
    try {
        const query = new URLSearchParams(location.search).get('lang');
        if (isLanguage(query)) return query;
        const stored = localStorage.getItem(STORAGE);
        if (isLanguage(stored)) return stored;
        const preferred = navigator.language.split('-')[0];
        if (isLanguage(preferred)) return preferred;
    } catch { /* Storage is optional; the questionnaire still works. */ }
    return 'en';
}
let language: Language = initialLanguage();
export const currentLanguage = () => language;
export function setLanguage(value: Language) {
    language = value;
    try { localStorage.setItem(STORAGE, value); } catch { /* Keep this tab usable. */ }
    const url = new URL(location.href); url.searchParams.set('lang', value);
    history.replaceState(null, '', url);
    document.documentElement.lang = value;
}
export function t(message: string, values: Record<string, string | number> = {}): string {
    const entry = (messages as Record<string, readonly string[]>)[message];
    const translated = language === 'en' ? message : entry?.[language === 'es' ? 0 : 1] ?? message;
    return translated.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}
export function localizeQuestion(question: Question, lang: Language): Question & { language: Language } {
    const translation = lang === 'en' ? undefined : question.translations?.[lang];
    if (!translation) return { ...question, language: 'en' };
    return { ...question, ...translation, language: lang, options: question.options?.map(option => ({ ...option, label: translation.options?.[option.id] ?? option.label })) };
}
// Only the static shell is translated here. React owns #feed and translates via t().
const originals = new WeakMap<Node, string>();
const attributes = new WeakMap<Element, Record<string, string>>();
export function translateShell() {
    for (const root of document.querySelectorAll('header.topbar, .sidebar, .progress-rail, footer.bottom-dock, #info, #import-dialog, a.skip')) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.parentElement?.closest('#save-status, #privacy-info, #language-select, #bottom-hint, #step-number, #sample-error, #import-error')) continue;
            if (!originals.has(node)) originals.set(node, node.textContent || '');
            const original = originals.get(node)!;
            node.textContent = original.replace(/\S(?:[\s\S]*\S)?/, value => t(value));
        }
        for (const el of [root, ...root.querySelectorAll('[aria-label], [title], [placeholder]')]) {
            if (!attributes.has(el)) attributes.set(el, Object.fromEntries(['aria-label','title','placeholder'].filter(key=>el.hasAttribute(key)).map(key=>[key,el.getAttribute(key)!])));
            for (const [key, value] of Object.entries(attributes.get(el)!)) el.setAttribute(key, t(value));
        }
    }
    document.title = t('Scroll Questionnaire — a listening experiment');
}
