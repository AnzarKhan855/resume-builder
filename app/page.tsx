"use client";

import { useRef, useState } from "react";

type ResumeData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string;
  education: string;
  projects: string;
  experience: string;
};

export default function Home() {
  const resumeRef = useRef<HTMLDivElement | null>(null);

  const [data, setData] = useState<ResumeData>({
    name: "Anzar Khan",
    title: "B.Tech AI & ML Student",
    email: "anzark964@gmail.com",
    phone: "",
    location: "Kanpur, India",
    summary:
      "Motivated B.Tech Artificial Intelligence and Machine Learning student with interest in web development, DSA, and AI-based applications.",
    skills: "C++, Python, React, Next.js, TypeScript, HTML, CSS, GitHub",
    education:
      "B.Tech in Artificial Intelligence and Machine Learning\nAllenhouse Institute of Technology\nExpected Graduation: 2027",
    projects:
      "Resume Builder - Built using Next.js, React, TypeScript and deployed on Vercel.\nStudent Feedback Analysis System - React.js, Django and Python based feedback collection platform.",
    experience: "Open to internships and beginner-level software development opportunities.",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const downloadPDF = async () => {
    if (!resumeRef.current) return;

    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf()
      .set({
        margin: 0.5,
        filename: `${data.name || "resume"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(resumeRef.current)
      .save();
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-center text-4xl font-bold text-gray-900">
          Resume Builder
        </h1>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              Enter Your Details
            </h2>

            <div className="space-y-4">
              <input
                name="name"
                value={data.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full rounded border p-3"
              />

              <input
                name="title"
                value={data.title}
                onChange={handleChange}
                placeholder="Professional Title"
                className="w-full rounded border p-3"
              />

              <input
                name="email"
                value={data.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full rounded border p-3"
              />

              <input
                name="phone"
                value={data.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full rounded border p-3"
              />

              <input
                name="location"
                value={data.location}
                onChange={handleChange}
                placeholder="Location"
                className="w-full rounded border p-3"
              />

              <textarea
                name="summary"
                value={data.summary}
                onChange={handleChange}
                placeholder="Summary"
                rows={4}
                className="w-full rounded border p-3"
              />

              <textarea
                name="skills"
                value={data.skills}
                onChange={handleChange}
                placeholder="Skills"
                rows={3}
                className="w-full rounded border p-3"
              />

              <textarea
                name="education"
                value={data.education}
                onChange={handleChange}
                placeholder="Education"
                rows={4}
                className="w-full rounded border p-3"
              />

              <textarea
                name="projects"
                value={data.projects}
                onChange={handleChange}
                placeholder="Projects"
                rows={5}
                className="w-full rounded border p-3"
              />

              <textarea
                name="experience"
                value={data.experience}
                onChange={handleChange}
                placeholder="Experience"
                rows={4}
                className="w-full rounded border p-3"
              />

              <button
                onClick={downloadPDF}
                className="w-full rounded bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Download Resume PDF
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              Resume Preview
            </h2>

            <div
              ref={resumeRef}
              className="min-h-[900px] bg-white p-8 text-gray-900"
            >
              <div className="border-b pb-4 text-center">
                <h1 className="text-4xl font-bold">{data.name}</h1>
                <p className="mt-1 text-lg text-gray-700">{data.title}</p>
                <p className="mt-2 text-sm">
                  {data.email} {data.phone && `| ${data.phone}`} |{" "}
                  {data.location}
                </p>
              </div>

              <ResumeSection title="Summary" content={data.summary} />
              <ResumeSection title="Skills" content={data.skills} />
              <ResumeSection title="Education" content={data.education} />
              <ResumeSection title="Projects" content={data.projects} />
              <ResumeSection title="Experience" content={data.experience} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ResumeSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="mt-6">
      <h2 className="border-b text-xl font-bold text-blue-700">{title}</h2>
      <div className="mt-2 whitespace-pre-line text-sm leading-6">{content}</div>
    </div>
  );
}