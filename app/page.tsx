
"use client";

import { useState } from "react";

const subjects = [
  { name: "Engineering Mathematics", short: "EM", color: "bg-violet-100 text-violet-700", progress: 65, next: "Eigenvalues & Eigenvectors" },
  { name: "Digital Electronics", short: "DE", color: "bg-blue-100 text-blue-700", progress: 40, next: "Number Systems" },
  { name: "Programming in C", short: "C", color: "bg-emerald-100 text-emerald-700", progress: 80, next: "Pointers and Arrays" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [showAdd, setShowAdd] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [mySubjects, setMySubjects] = useState(subjects);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-6 md:flex md:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">S</div>
            <div>
              <h1 className="text-xl font-bold">StudyPilot</h1>
              <p className="text-xs text-slate-500">Your AI study companion</p>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {["Overview", "My Subjects", "Study Planner", "Practice Quiz"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${activeTab === tab ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}>
                {tab === "Overview" ? "⌂" : tab === "My Subjects" ? "▤" : tab === "Study Planner" ? "◷" : "✓"}{" "}
                {tab}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-indigo-600 p-4 text-white">
            <p className="font-semibold">Small steps, big results.</p>
            <p className="mt-2 text-sm text-indigo-100">A little focused study every day adds up.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">THURSDAY · YOUR LEARNING SPACE</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Let's make progress<span className="text-indigo-600">.</span>
              </h2>
              <p className="mt-2 text-slate-500">Welcome back! Ready for a focused study session?</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">S</div>
          </header>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-sm lg:col-span-2">
              <p className="text-sm font-medium text-indigo-200">YOUR NEXT STEP</p>
              <h3 className="mt-3 text-2xl font-bold">Build your study streak</h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-indigo-100">
                Choose a subject, review one concept, and test what you remember.
                Your study journey starts with one small step.
              </p>
              <button onClick={() => setActiveTab("Study Planner")}
                className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
                Open study planner →
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">SUBJECTS ADDED</p>
              <p className="mt-3 text-4xl font-bold">{mySubjects.length}</p>
              <p className="mt-2 text-sm text-slate-500">Keep your learning organised.</p>
              <button onClick={() => setShowAdd(true)}
                className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                + Add a subject
              </button>
            </div>
          </div>

          {showAdd && (
            <div className="mt-5 rounded-2xl border border-indigo-100 bg-white p-5">
              <h3 className="font-semibold">Add a subject</h3>
              <form onSubmit={(event) => {
                event.preventDefault();
                if (!subjectName.trim()) return;
                setMySubjects([...mySubjects, {
                  name: subjectName.trim(),
                  short: subjectName.trim().slice(0, 2).toUpperCase(),
                  color: "bg-amber-100 text-amber-700",
                  progress: 0,
                  next: "Add your first topic"
                }]);
                setSubjectName("");
                setShowAdd(false);
              }} className="mt-3 flex flex-wrap gap-3">
                <input value={subjectName} onChange={(event) => setSubjectName(event.target.value)}
                  placeholder="e.g. Data Structures" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" />
                <button className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white">Save subject</button>
                <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl px-4 py-3 text-slate-500">Cancel</button>
              </form>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold">{activeTab === "Overview" ? "Your subjects" : activeTab}</h3>
              <p className="mt-1 text-sm text-slate-500">Pick up where you left off.</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100">
              + Add subject
            </button>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {mySubjects.map((subject) => (
              <article key={subject.name} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${subject.color}`}>
                    {subject.short}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold">{subject.name}</h4>
                    <p className="mt-1 text-sm text-slate-500">Next topic: {subject.next}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Learning progress</span>
                  <span className="font-semibold">{subject.progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${subject.progress}%` }} />
                </div>
                <button onClick={() => setActiveTab("Study Planner")}
                  className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                  Continue studying →
                </button>
              </article>
            ))}
          </div>

          <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
            StudyPilot · Learn at your pace. Grow with confidence.
          </footer>
        </section>
      </div>
    </main>
  );
}
