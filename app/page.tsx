
"use client";

import { useEffect, useState } from "react";

type Subject = {
  id: string;
  name: string;
  examDate: string;
  topics: string;
  createdAt: number;
};

const STORAGE_KEY = "studypilot-subjects-v1";

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [topics, setTopics] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [today, setToday] = useState("");

  // Load saved subjects once the page opens in the browser.
  useEffect(() => {
    setToday(getLocalDateString(new Date()));

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (
          Array.isArray(parsed) &&
          parsed.every(
            (item) =>
              item &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.examDate === "string" &&
              typeof item.topics === "string" &&
              typeof item.createdAt === "number"
          )
        ) {
          setSubjects(parsed as Subject[]);
        }
      }
    } catch {
      setError(
        "Saved subjects could not be read. Your existing browser data has not been intentionally deleted."
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save every subject change to this browser.
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    } catch {
      setError(
        "Your browser could not save the subjects. Check available storage and browser settings."
      );
    }
  }, [subjects, loaded]);

  function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatDate(dateString: string): string {
    if (!dateString) return "Date not set";

    return new Date(`${dateString}T12:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getDaysLeft(dateString: string): number | null {
    if (!dateString || !today) return null;

    const exam = new Date(`${dateString}T12:00:00`).getTime();
    const current = new Date(`${today}T12:00:00`).getTime();

    return Math.round((exam - current) / 86400000);
  }

  function resetForm() {
    setName("");
    setExamDate("");
    setTopics("");
    setEditingId(null);
    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const cleanedName = name.trim();
    const cleanedTopics = topics.trim();

    if (!cleanedName) {
      setError("Please enter a subject name.");
      return;
    }

    if (examDate && today && examDate < today) {
      setError("The exam date cannot be in the past.");
      return;
    }

    const duplicate = subjects.some(
      (subject) =>
        subject.name.toLowerCase() === cleanedName.toLowerCase() &&
        subject.id !== editingId
    );

    if (duplicate) {
      setError("This subject already exists. Try editing the existing one.");
      return;
    }

    if (editingId) {
      setSubjects((previous) =>
        previous.map((subject) =>
          subject.id === editingId
            ? {
                ...subject,
                name: cleanedName,
                examDate,
                topics: cleanedTopics,
              }
            : subject
        )
      );

      setNotice(`${cleanedName} updated successfully.`);
    } else {
      const newSubject: Subject = {
        id: crypto.randomUUID(),
        name: cleanedName,
        examDate,
        topics: cleanedTopics,
        createdAt: Date.now(),
      };

      setSubjects((previous) => [...previous, newSubject]);
      setNotice(`${cleanedName} saved successfully.`);
    }

    resetForm();
  }

  function startEditing(subject: Subject) {
    setName(subject.name);
    setExamDate(subject.examDate);
    setTopics(subject.topics);
    setEditingId(subject.id);
    setError("");
    setNotice("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteSubject(subject: Subject) {
    const confirmed = window.confirm(
      `Delete "${subject.name}" from My Subjects? This cannot be undone.`
    );

    if (!confirmed) return;

    setSubjects((previous) =>
      previous.filter((item) => item.id !== subject.id)
    );

    if (editingId === subject.id) resetForm();

    setNotice(`${subject.name} deleted.`);
    setError("");
  }

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const upcomingExams = subjects.filter((subject) => {
    const days = getDaysLeft(subject.examDate);
    return days !== null && days >= 0;
  }).length;

  const totalTopics = subjects.reduce(
    (total, subject) =>
      total +
      subject.topics.split("\n").filter((topic) => topic.trim()).length,
    0
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              ✦ StudyPilot
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Your learning space.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Organize your subjects, keep track of exam dates, and
              prepare with a plan that works for you.
            </p>
          </div>

          <a
            href="/planner"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Open study planner <span>→</span>
          </a>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">My subjects</p>
            <p className="mt-2 text-3xl font-bold">{subjects.length}</p>
            <p className="mt-1 text-xs text-slate-400">
              Saved in this browser
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Upcoming exams</p>
            <p className="mt-2 text-3xl font-bold">{upcomingExams}</p>
            <p className="mt-1 text-xs text-slate-400">
              Today or a future date
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Syllabus topics</p>
            <p className="mt-2 text-3xl font-bold">{totalTopics}</p>
            <p className="mt-1 text-xs text-slate-400">
              Across all your subjects
            </p>
          </div>
        </section>

        <section className="mt-8 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {editingId ? "Edit details" : "Build your semester"}
              </p>
              <h2 className="mt-2 text-xl font-bold">
                {editingId ? "Update subject" : "Add a subject"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Save the subject details here so you can find them
                whenever you return to this browser.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="subjectName"
                  className="mb-2 block text-sm font-semibold"
                >
                  Subject name *
                </label>
                <input
                  id="subjectName"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Engineering Mathematics"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="subjectExamDate"
                  className="mb-2 block text-sm font-semibold"
                >
                  Exam date
                </label>
                <input
                  id="subjectExamDate"
                  type="date"
                  min={today || undefined}
                  value={examDate}
                  onChange={(event) => setExamDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="mt-2 text-xs text-slate-400">
                  You can leave this blank and add it later.
                </p>
              </div>

              <div>
                <label
                  htmlFor="subjectTopics"
                  className="mb-2 block text-sm font-semibold"
                >
                  Syllabus topics
                </label>
                <textarea
                  id="subjectTopics"
                  rows={5}
                  maxLength={10000}
                  value={topics}
                  onChange={(event) => setTopics(event.target.value)}
                  placeholder={
                    "Matrices | Difficult\nEigenvalues | Medium\nDifferential equations | Easy"
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 leading-6 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="mt-2 text-xs text-slate-400">
                  Enter one topic per line. Difficulty labels are optional.
                </p>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {notice && (
                <p
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={!loaded}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingId ? "Save changes" : "Save subject"} →
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel editing
                </button>
              )}
            </form>
          </div>

          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Subjects</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {subjects.length === 0
                    ? "Your saved subjects will appear here."
                    : `${subjects.length} subject${subjects.length === 1 ? "" : "s"} in your collection`}
                </p>
              </div>
            </div>

            {subjects.length > 0 && (
              <div className="mb-4">
                <label htmlFor="searchSubjects" className="sr-only">
                  Search subjects
                </label>
                <input
                  id="searchSubjects"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your subjects..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            )}

            {!loaded ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Loading your saved subjects...
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  📚
                </div>
                <h3 className="mt-4 font-bold">
                  {search ? "No matching subjects" : "Start with your first subject"}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  {search
                    ? "Try a different search term."
                    : "Add a subject using the form. It will appear here and remain saved in this browser."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubjects.map((subject) => {
                  const daysLeft = getDaysLeft(subject.examDate);
                  const topicList = subject.topics
                    .split("\n")
                    .filter((topic) => topic.trim());

                  return (
                    <article
                      key={subject.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 sm:p-6"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                          📘
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-lg font-bold">
                            {subject.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {topicList.length} syllabus topic
                            {topicList.length === 1 ? "" : "s"}
                          </p>
                        </div>

                        <span
                          className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                          title="Saved in this browser"
                        >
                          Saved
                        </span>
                      </div>

                      <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          Exam date
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatDate(subject.examDate)}
                        </p>

                        {daysLeft !== null && (
                          <p
                            className={`mt-1 text-sm ${
                              daysLeft === 0
                                ? "font-semibold text-amber-700"
                                : "text-slate-500"
                            }`}
                          >
                            {daysLeft === 0
                              ? "Exam is today"
                              : `${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining`}
                          </p>
                        )}
                      </div>

                      {topicList.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Syllabus preview
                          </p>
                          <ul className="space-y-2">
                            {topicList.slice(0, 3).map((topic, index) => (
                              <li
                                key={`${subject.id}-topic-${index}`}
                                className="flex items-start gap-2 text-sm text-slate-600"
                              >
                                <span className="mt-0.5 text-indigo-500">
                                  •
                                </span>
                                <span className="break-words">{topic}</span>
                              </li>
                            ))}
                          </ul>

                          {topicList.length > 3 && (
                            <p className="mt-2 text-xs text-slate-400">
                              + {topicList.length - 3} more topics
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => startEditing(subject)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteSubject(subject)}
                          className="rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>

                        <a
                          href="/planner"
                          className="ml-auto rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                          Open planner →
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 py-5 text-center text-xs leading-5 text-slate-400">
          StudyPilot · Built to make exam preparation more organized.
          <br />
          Your subjects are saved locally in this browser, not in a cloud database.
        </footer>
      </div>
    </main>
  );
}
