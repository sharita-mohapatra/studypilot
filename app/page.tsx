
"use client";

import { useEffect, useState, type FormEvent } from "react";

type Difficulty = "Easy" | "Medium" | "Difficult";

type Topic = {
  name: string;
  difficulty: Difficulty;
};

type StudyDay = {
  date: string;
  dayNumber: number;
  topics: string[];
  studyMinutes: number;
  revisionMinutes: number;
  isFinalDay: boolean;
};

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  Difficult: 0,
  Medium: 1,
  Easy: 2,
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function displayDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PlannerPage() {
  const [today, setToday] = useState("");
  const [subject, setSubject] = useState("Engineering Mathematics");
  const [examDate, setExamDate] = useState("");
  const [hours, setHours] = useState("2");
  const [topicsText, setTopicsText] = useState(
    "Matrices and linear equations\nEigenvalues and eigenvectors\nDifferential equations"
  );
  const [difficulties, setDifficulties] = useState<
    Record<string, Difficulty>
  >({});
  const [schedule, setSchedule] = useState<StudyDay[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setToday(formatDate(new Date()));
  }, []);

  const topics: Topic[] = topicsText
    .split("\n")
    .map((name) => name.trim())
    .filter(Boolean)
    .filter((name, index, all) => all.indexOf(name) === index)
    .map((name) => ({
      name,
      difficulty: difficulties[name] ?? "Medium",
    }));

  function updateDifficulty(name: string, difficulty: Difficulty) {
    setDifficulties((previous) => ({
      ...previous,
      [name]: difficulty,
    }));
    setSchedule([]);
  }

  function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSchedule([]);

    if (!today || !examDate) {
      setError("Please select an exam date.");
      return;
    }

    if (examDate < today) {
      setError("Your exam date cannot be in the past.");
      return;
    }

    if (topics.length === 0) {
      setError("Please enter at least one syllabus topic.");
      return;
    }

    // Sort the topics: difficult first, then medium, then easy.
    const sortedTopics = [...topics].sort(
      (a, b) =>
        DIFFICULTY_ORDER[a.difficulty] -
        DIFFICULTY_ORDER[b.difficulty]
    );

    // Use UTC day numbers to avoid daylight-saving calculation issues.
    const toDayNumber = (value: string) => {
      const [year, month, day] = value.split("-").map(Number);
      return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
    };

    const firstDay = toDayNumber(today);
    const lastDay = toDayNumber(examDate);

    // Study from today until the day before the exam.
    // If the exam is today, provide a short same-day revision plan.
    const dayCount = Math.max(1, lastDay - firstDay);

    const dailyMinutes = Number(hours) * 60;
    const revisionMinutes = Math.round(dailyMinutes * 0.2);
    const studyMinutes = dailyMinutes - revisionMinutes;

    const newSchedule: StudyDay[] = Array.from(
      { length: dayCount },
      (_, index) => {
        const date = new Date(firstDay * 86400000 + index * 86400000);
        const dateString = formatDate(date);

        // Spread topics across the available days while keeping
        // difficult topics earlier in the plan.
        const assignedTopics = sortedTopics
          .filter(
            (_, topicIndex) =>
              Math.floor((topicIndex * dayCount) / sortedTopics.length) ===
              index
          )
          .map((topic) => `${topic.name} (${topic.difficulty})`);

        return {
          date: dateString,
          dayNumber: index + 1,
          topics: assignedTopics,
          studyMinutes,
          revisionMinutes,
          isFinalDay: index === dayCount - 1,
        };
      }
    );

    setSchedule(newSchedule);
  }

  const totalStudyMinutes = schedule.reduce(
    (total, day) => total + day.studyMinutes,
    0
  );

  const totalRevisionMinutes = schedule.reduce(
    (total, day) => total + day.revisionMinutes,
    0
  );

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <a
          href="/"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
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
            Prioritize difficult topics, build consistency, and reserve time
            for revision before your exam.
          </p>
        </header>

        <form
          onSubmit={createPlan}
          className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label
              htmlFor="subject"
              className="mb-2 block text-sm font-semibold"
            >
              Subject
            </label>

            <select
              id="subject"
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setSchedule([]);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <option>Engineering Mathematics</option>
              <option>Digital Electronics</option>
              <option>Programming in C</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="examDate"
              className="mb-2 block text-sm font-semibold"
            >
              Exam date
            </label>

            <input
              id="examDate"
              type="date"
              required
              min={today || undefined}
              value={examDate}
              onChange={(event) => {
                setExamDate(event.target.value);
                setSchedule([]);
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="hours"
              className="mb-2 block text-sm font-semibold"
            >
              Available study time per day
            </label>

            <select
              id="hours"
              value={hours}
              onChange={(event) => {
                setHours(event.target.value);
                setSchedule([]);
              }}
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
            <label
              htmlFor="topics"
              className="mb-2 block text-sm font-semibold"
            >
              Syllabus topics
            </label>

            <textarea
              id="topics"
              value={topicsText}
              onChange={(event) => {
                setTopicsText(event.target.value);
                setSchedule([]);
              }}
              required
              rows={5}
              placeholder={
                "Matrices and linear equations\nEigenvalues and eigenvectors\nDifferential equations"
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />

            <p className="mt-2 text-xs text-slate-500">
              Enter one topic per line. Duplicate topic names are ignored.
            </p>
          </div>

          {topics.length > 0 && (
            <section className="rounded-xl border border-slate-200 p-4">
              <h2 className="font-semibold">Topic difficulty</h2>
              <p className="mt-1 text-sm text-slate-500">
                Mark the harder topics so StudyPilot schedules them earlier.
              </p>

              <div className="mt-4 space-y-4">
                {topics.map((topic) => (
                  <div
                    key={topic.name}
                    className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"
                  >
                    <span className="text-sm font-medium">
                      {topic.name}
                    </span>

                    <select
                      aria-label={`Difficulty for ${topic.name}`}
                      value={topic.difficulty}
                      onChange={(event) =>
                        updateDifficulty(
                          topic.name,
                          event.target.value as Difficulty
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="Difficult">Difficult</option>
                      <option value="Medium">Medium</option>
                      <option value="Easy">Easy</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="rounded-xl bg-indigo-50 p-4">
            <p className="font-semibold text-indigo-900">
              Your daily time allocation
            </p>
            <p className="mt-1 text-sm text-indigo-800">
              {Number(hours) * 0.8} hours for topic study and{" "}
              {Number(hours) * 0.2} hours for revision and practice.
            </p>
            <p className="mt-1 text-xs text-indigo-700">
              Revision receives 20% of your available study time.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            Generate my timetable →
          </button>
        </form>

        {schedule.length > 0 && (
          <section className="mt-8">
            <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">
                Your personalized timetable
              </p>

              <h2 className="mt-2 text-2xl font-bold">{subject}</h2>

              <p className="mt-2 text-sm text-indigo-100">
                {schedule.length} study day(s) · Exam on{" "}
                {displayDate(examDate)}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-sm text-indigo-100">Topic study</p>
                  <p className="mt-1 text-2xl font-bold">
                    {(totalStudyMinutes / 60).toFixed(1)} h
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-sm text-indigo-100">Revision</p>
                  <p className="mt-1 text-2xl font-bold">
                    {(totalRevisionMinutes / 60).toFixed(1)} h
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {schedule.map((day) => (
                <article
                  key={day.date}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                        Day {day.dayNumber}
                      </p>

                      <h3 className="mt-1 text-lg font-bold">
                        {displayDate(day.date)}
                      </h3>
                    </div>

                    <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                      {day.studyMinutes + day.revisionMinutes} minutes planned
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="font-semibold">📘 Topic study</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {day.studyMinutes} minutes
                      </p>

                      {day.topics.length > 0 ? (
                        <ul className="mt-3 space-y-2">
                          {day.topics.map((topic) => (
                            <li
                              key={topic}
                              className="text-sm text-slate-700"
                            >
                              • {topic}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-slate-600">
                          Consolidate difficult concepts and practise
                          questions from earlier topics.
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl bg-amber-50 p-4">
                      <p className="font-semibold text-amber-900">
                        🔁 Revision and practice
                      </p>

                      <p className="mt-1 text-sm text-amber-800">
                        {day.revisionMinutes} minutes
                      </p>

                      <p className="mt-3 text-sm text-amber-900">
                        {day.isFinalDay
                          ? "Review key formulas, recall important concepts, and solve a short practice test."
                          : "Recall what you learned, review notes, and solve practice questions."}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              This timetable uses your selected difficulty levels and a
              20% revision allocation. Review the schedule and adjust it
              to match your actual syllabus and pace.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
