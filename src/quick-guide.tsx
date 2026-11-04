import React, { useEffect, useRef, useState } from 'react';

const menu = [
  {label: 'Home', path: 'M3 10 12 3 21 10V20H3Z M9 20V13H15V20'},
  {label: 'Listen', path: 'M4 13V11A8 8 0 0 1 20 11V13 M3 12H7V20H3Z M17 12H21V20H17Z'},
  {label: 'Progress', path: 'M5 20V14 M12 20V4 M19 20V9'},
  {label: 'Info', path: 'M12 11V17 M12 7H12.01 M21 12A9 9 0 1 1 3 12A9 9 0 1 1 21 12'}
];
const steps = [
  { title: 'Your menu is down here.', text: 'Home takes you back. Listen opens your session. Progress lets you review. Info explains the study and your data.', kind: 'menu' },
  { title: 'One question at a time.', text: 'Answer, then swipe up or press Continue. Longer cards scroll inside. You can always go back to an earlier answer.', kind: 'scroll' },
  { title: 'Compare with your ears.', text: 'Press Play, then switch A, B and C without restarting the music. Rank what you hear. There are no right answers.', kind: 'audio' }
];

export function QuickGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (open) { setStep(0); dialog.current?.showModal(); }
    else dialog.current?.close();
  }, [open]);
  const current = steps[step];
  return <dialog ref={dialog} className="quick-guide" aria-labelledby="guide-title" onCancel={onClose} onClose={onClose}>
    <div className="guide-top"><span>QUICK GUIDE · {step + 1} / 3</span><button className="quiet" aria-label="Close guide" onClick={onClose}>×</button></div>
    <div className={`guide-art guide-${current.kind}`} aria-hidden="true">
      {current.kind === 'menu' && menu.map(item => <span key={item.label}><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={item.path}/></svg><small>{item.label}</small></span>)}
      {current.kind === 'scroll' && <><span className="guide-card-line"/><strong>↑</strong><span className="guide-card-line"/></>}
      {current.kind === 'audio' && <><span>A</span><span>B</span><span>C</span></>}
    </div>
    <div aria-live="polite" aria-atomic="true"><h2 id="guide-title">{current.title}</h2><p>{current.text}</p></div>
    <div className="guide-actions"><button className="quiet" onClick={onClose}>Skip guide</button><div className="guide-dots" aria-hidden="true">{steps.map((_, index) => <i key={index} className={index === step ? 'active' : ''}/>)}</div><button className="primary" onClick={() => step < 2 ? setStep(step + 1) : onClose()}>{step < 2 ? 'Next' : 'Got it'}</button></div>
  </dialog>;
}
