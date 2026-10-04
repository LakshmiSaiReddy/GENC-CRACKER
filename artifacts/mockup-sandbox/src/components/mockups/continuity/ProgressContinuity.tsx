import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cloud,
  Command,
  Laptop,
  LockKeyhole,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import "./progress-continuity.css";

type Phase = {
  name: string;
  weeks: string;
  complete: number;
  tint: string;
};

const phases: Phase[] = [
  { name: "Groundwork", weeks: "01—04", complete: 4, tint: "sage" },
  { name: "Coding core", weeks: "05—10", complete: 6, tint: "ochre" },
  { name: "Security", weeks: "11—16", complete: 2, tint: "coral" },
  { name: "Cloud", weeks: "17—21", complete: 0, tint: "blue" },
  { name: "Build", weeks: "22—27", complete: 0, tint: "sage" },
  { name: "Deepen", weeks: "28—32", complete: 0, tint: "ochre" },
  { name: "Interview", weeks: "33—37", complete: 0, tint: "coral" },
  { name: "Placement", weeks: "38—40", complete: 0, tint: "blue" },
];

const initialTasks = [
  { id: "read", title: "Read the week’s security brief", detail: "25 min · Foundations", done: true },
  { id: "lab", title: "Run one network lab", detail: "45 min · Hands-on", done: false },
  { id: "note", title: "Write down one useful finding", detail: "10 min · Reflection", done: false },
];

export function ProgressContinuity() {
  const [phaseIndex, setPhaseIndex] = useState(2);
  const [completedWeeks, setCompletedWeeks] = useState(12);
  const [tasks, setTasks] = useState(initialTasks);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [restored, setRestored] = useState(false);
  const phase = phases[phaseIndex];
  const progress = useMemo(() => Math.round((completedWeeks / 40) * 100), [completedWeeks]);
  const focusWeek = Math.min(completedWeeks + 1, 40);
  const tasksDone = tasks.filter((task) => task.done).length;

  const finishWeek = () => {
    if (completedWeeks < 40) {
      setCompletedWeeks((current) => Math.min(current + 1, 40));
      setTasks((current) => current.map((task) => ({ ...task, done: true })));
    }
  };

  return (
    <main className="continuity-shell">
      <div className="continuity-paper-grain" aria-hidden="true" />
      <div className="continuity-app">
        <header className="continuity-topbar">
          <div className="continuity-brand">
            <span className="continuity-mark"><Command size={17} strokeWidth={2.2} /></span>
            <span className="continuity-wordmark">GENC <b>CRACKER</b></span>
            <span className="continuity-brand-divider" />
            <span className="continuity-edition">PREPARATION FIELD GUIDE</span>
          </div>
          <button className="continuity-profile" onClick={() => setHistoryOpen(true)} aria-label="View account and sync history">
            <span className="continuity-avatar">LS</span>
            <span className="continuity-profile-name">Lakshmi Sai Reddy</span>
            <ChevronRight size={15} />
          </button>
        </header>

        <section className="continuity-intro">
          <div>
            <div className="continuity-eyebrow"><span className="continuity-eyebrow-dot" /> YOUR PLACEMENT JOURNEY <span className="continuity-eyebrow-slash">/</span> 40 WEEKS</div>
            <h1>A little further,<br className="continuity-mobile-break" /> every week.</h1>
            <p className="continuity-intro-note">A steady route from first principles to your next opportunity.</p>
          </div>
          <div className="continuity-sync-card">
            <div className="continuity-sync-icon"><Cloud size={18} /></div>
            <div className="continuity-sync-copy">
              <div className="continuity-sync-label">YOUR PROGRESS IS WITH YOU</div>
              <div className="continuity-sync-title">Saved to Lakshmi’s account</div>
              <div className="continuity-sync-meta"><span className="continuity-live-dot" /> Last saved just now <span className="continuity-sync-divider">·</span> Any device</div>
            </div>
            <button className="continuity-sync-action" onClick={() => setHistoryOpen(true)} aria-label="Open sync history"><ChevronRight size={17} /></button>
          </div>
        </section>

        <section className="continuity-ledger" aria-label="Roadmap progress">
          <div className="continuity-ledger-head">
            <div>
              <div className="continuity-overline">THE LONG VIEW</div>
              <div className="continuity-ledger-title"><strong>{String(completedWeeks).padStart(2, "0")}</strong><span> / 40 weeks recorded</span></div>
            </div>
            <div className="continuity-progress-caption">{progress}% <span>of the route behind you</span></div>
          </div>
          <div className="continuity-route" role="group" aria-label="Choose a preparation phase">
            <div className="continuity-route-line"><span style={{ width: `${progress}%` }} /></div>
            {phases.map((item, index) => (
              <button
                key={item.name}
                className={`continuity-stop ${index === phaseIndex ? "is-current" : ""} ${item.complete > 0 ? "is-visited" : ""}`}
                onClick={() => setPhaseIndex(index)}
                aria-pressed={phaseIndex === index}
              >
                <span className={`continuity-stop-dot tint-${item.tint}`}>
                  {item.complete === Number(item.weeks.slice(3)) - Number(item.weeks.slice(0, 2)) + 1 ? <Check size={13} /> : null}
                </span>
                <span className="continuity-stop-copy">
                  <span className="continuity-stop-weeks">{item.weeks}</span>
                  <span className="continuity-stop-name">{item.name}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="continuity-workspace">
          <div className="continuity-checkpoint">
            <div className="continuity-checkpoint-head">
              <div className="continuity-overline">CURRENT CHECKPOINT <span>·</span> PHASE {String(phaseIndex + 1).padStart(2, "0")}</div>
              <span className="continuity-location"><MapPin size={13} /> {phase.weeks.split("—")[0]}—{phase.weeks.split("—")[1]}</span>
            </div>
            <div className="continuity-checkpoint-main">
              <div className="continuity-week-stamp"><span>WEEK</span><strong>{String(focusWeek).padStart(2, "0")}</strong><span>OF 40</span></div>
              <div className="continuity-checkpoint-copy">
                <div className="continuity-phase-name">{phase.name}</div>
                <h2>{phaseIndex === 2 ? "Make security tangible." : `Keep moving through ${phase.name.toLowerCase()}.`}</h2>
                <p>{phaseIndex === 2
                  ? "Build a clear picture of how systems are protected. Learn the idea, test it in practice, then make it your own."
                  : "A focused stretch of the plan, broken into practical work you can carry at your own pace."}</p>
                <div className="continuity-checkpoint-links">
                  <span><BookOpen size={14} /> Learn · apply · explain</span>
                  <span><Clock3 size={14} /> About 5 hours this week</span>
                </div>
              </div>
              <div className={`continuity-seal tint-${phase.tint}`} aria-hidden="true">
                {phaseIndex === 3 ? <Cloud size={23} /> : phaseIndex === 0 ? <Sparkles size={23} /> : <ShieldCheck size={23} />}
                <span>FIELD<br />NOTE {String(phaseIndex + 1).padStart(2, "0")}</span>
              </div>
            </div>
            <div className="continuity-checkpoint-foot">
              <div className="continuity-progress-inline"><span className="continuity-mini-progress"><i style={{ width: `${Math.round((tasksDone / tasks.length) * 100)}%` }} /></span><span>{tasksDone} of {tasks.length} steps done</span></div>
              <button className="continuity-complete" onClick={finishWeek} disabled={completedWeeks === 40}>
                {completedWeeks === 40 ? "Journey complete" : "Mark week complete"} <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <aside className="continuity-today">
            <div className="continuity-today-heading">
              <div>
                <div className="continuity-overline">ON THE DESK</div>
                <h2>This week’s fieldwork</h2>
              </div>
              <span className="continuity-date"><CalendarDays size={14} /> WEEK {String(focusWeek).padStart(2, "0")}</span>
            </div>
            <div className="continuity-task-list">
              {tasks.map((task, index) => (
                <button
                  className={`continuity-task ${task.done ? "is-done" : ""}`}
                  key={task.id}
                  onClick={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))}
                  aria-pressed={task.done}
                >
                  <span className="continuity-task-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="continuity-task-check">{task.done && <Check size={13} />}</span>
                  <span className="continuity-task-copy"><strong>{task.title}</strong><small>{task.detail}</small></span>
                  <ChevronRight size={15} className="continuity-task-arrow" />
                </button>
              ))}
            </div>
            <div className="continuity-today-footer">
              <span><Laptop size={14} /> Made for small, repeatable sessions</span>
              <button onClick={() => setHistoryOpen(true)}>Activity <ArrowRight size={13} /></button>
            </div>
          </aside>
        </section>

        <footer className="continuity-footer">
          <div className="continuity-footer-quote"><span className="continuity-footer-star">✳</span> Progress is a record of showing up.</div>
          <div className="continuity-footer-saved"><LockKeyhole size={13} /> Private to your workspace <span>·</span> sync follows your sign-in</div>
        </footer>
      </div>

      {historyOpen && (
        <div className="continuity-modal-backdrop" role="presentation" onClick={() => setHistoryOpen(false)}>
          <section className="continuity-history" role="dialog" aria-modal="true" aria-labelledby="continuity-history-title" onClick={(event) => event.stopPropagation()}>
            <button className="continuity-history-close" onClick={() => setHistoryOpen(false)} aria-label="Close sync history"><X size={17} /></button>
            <div className="continuity-history-mark"><Cloud size={20} /></div>
            <div className="continuity-overline">ACCOUNT CONTINUITY</div>
            <h2 id="continuity-history-title">Your work has a home.</h2>
            <p>Roadmap checkpoints, notes and practice stay with your signed-in workspace—not this browser.</p>
            <div className="continuity-history-event"><span><CheckCircle2 size={16} /></span><div><strong>Progress saved</strong><small>Just now · Lakshmi Sai Reddy</small></div><span className="continuity-history-device">THIS DEVICE</span></div>
            <div className="continuity-history-event"><span><RotateCcw size={16} /></span><div><strong>{restored ? "Workspace restored" : "Ready to restore"}</strong><small>{restored ? `${completedWeeks} completed weeks found` : "Sign in on another device to pick up here"}</small></div><span className="continuity-history-device"><LockKeyhole size={12} /> PRIVATE</span></div>
            <button className="continuity-restore" onClick={() => setRestored(true)}><RotateCcw size={15} /> {restored ? "Latest workspace loaded" : "Check latest workspace"} <ArrowRight size={14} /></button>
            <div className="continuity-history-foot"><ShieldCheck size={14} /> Progress is tied to your account. Sign-in is required to restore it.</div>
          </section>
        </div>
      )}
    </main>
  );
}

export default ProgressContinuity;