
"use client";

import { useState } from "react";
import { useEffect } from "react";

export default function PlannerPage() {
    const [today, setToday] = useState("");

useEffect(() => {
  setToday(new Date().toLocaleDateString("en-CA"));
}, []);
  const [subject, setSubject] = useState("Engineering Mathematics");
  const [examDate, setExamDate] = useState("");
  const [hours, setHours] = useState("2");
  const [topics, setTopics] = useState("");
  const [generated, setGenerated] = useState(false);

  function createPlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerated(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm font-semibold text-indigo-600">
          ← Back to dashboard
        </a>

        <header className="mt-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            StudyPilot · Study Planner
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Plan your preparation.
          </h1>
          <p className="mt-3 text-slate-500">
            Turn your exam deadline and syllabus into a manageable study routine.
          </p>
        </header>

        <form
          onSubmit={createPlan}
          className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <option>Engineering Mathematics</option>
              <option>Digital Electronics</option>
              <option>Programming in C</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Exam date</label>
            <input
              type="date"
              required
             min={today || undefined}
              value={examDate}
              onChange={(e) => {
                setExamDate(e.target.value);
                setGenerated(false);
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Available study time per day
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="5">5 hours</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Syllabus topics
            </label>
            <textarea
              value={topics}
              onChange={(e) => {
                setTopics(e.target.value);
                setGenerated(false);
              }}
              required
              rows={4}
              placeholder={"Matrices and linear equations\nEigenvalues and eigenvectors\nDifferential equations"}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
            <p className="mt-2 text-xs text-slate-500">
              Enter one topic per line.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            Create my study plan →
          </button>
        </form>

        {generated && (
          <section className="mt-7 rounded-2xl border border-indigo-100 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold">Your study plan</h2>
            <p className="mt-2 text-sm text-slate-500">
              {subject} · {hours} hour(s) per day
            </p>

            <div className="mt-5 rounded-xl bg-indigo-50 p-4">
              <p className="font-semibold">
                {Math.max(
                  0,
                  Math.ceil(
                    (new Date(examDate + "T00:00:00").getTime() -
                      new Date(new Date().toDateString()).getTime()) /
                      86400000
                  )
                )}{" "}
                days until your exam
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Use the available time consistently and leave room for revision.
              </p>
            </div>

            <ol className="mt-6 space-y-4">
              {topics
                .split("\n")
                .map((topic) => topic.trim())
                .filter(Boolean)
                .map((topic, index) => (
                  <li key={`${topic}-${index}`} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{topic}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Study for {hours} hour(s), practise questions, then review your notes.
                      </p>
                    </div>
                  </li>
                ))}
            </ol>

            <p className="mt-6 text-xs text-slate-400">
              This is a basic topic checklist, not an AI-generated or date-by-date timetable yet.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
