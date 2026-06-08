<<<<<<< HEAD
"use client";

import { useState } from "react";

export default function Home() {
  const [template, setTemplate] = useState("blue");

  const [resume, setResume] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    skills: "",
    education: "",
    projects: "",
    experience: "",
  });

  const handleChange = (field: string, value: string) => {
    setResume({ ...resume, [field]: value });
  };

  const printResume = () => {
    window.print();
  };

  const downloadPDF = async () => {
    const element = document.getElementById("resume-preview");

    if (element === null) {
      alert("Resume preview not found");
      return;
    }

    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf().from(element as HTMLElement).save("resume.pdf");
  };

  const headerColor =
    template === "blue"
      ? "#2563eb"
      : template === "dark"
      ? "#111827"
      : "#047857";

  return (
    <main style={{ display: "flex", gap: "30px", padding: "30px" }}>
      <div style={{ width: "40%", background: "white", padding: "20px" }}>
        <h1>Resume Builder</h1>

        <label>Select Template</label>
        <select
          onChange={(e) => setTemplate(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        >
          <option value="blue">Blue Template</option>
          <option value="dark">Dark Template</option>
          <option value="green">Green Template</option>
        </select>

        <input placeholder="Full Name" onChange={(e) => handleChange("name", e.target.value)} />
        <input placeholder="Email" onChange={(e) => handleChange("email", e.target.value)} />
        <input placeholder="Phone" onChange={(e) => handleChange("phone", e.target.value)} />
        <input placeholder="LinkedIn URL" onChange={(e) => handleChange("linkedin", e.target.value)} />

        <textarea placeholder="Skills" onChange={(e) => handleChange("skills", e.target.value)} />
        <textarea placeholder="Education" onChange={(e) => handleChange("education", e.target.value)} />
        <textarea placeholder="Projects" onChange={(e) => handleChange("projects", e.target.value)} />
        <textarea placeholder="Experience" onChange={(e) => handleChange("experience", e.target.value)} />

        <button onClick={printResume}>Print Resume</button>
        <button onClick={downloadPDF}>Download PDF</button>
      </div>

      <div id="resume-preview" style={{ width: "60%", background: "white", padding: "30px" }}>
        <div style={{ background: headerColor, color: "white", padding: "20px" }}>
          <h1>{resume.name || "Your Name"}</h1>
          <p>{resume.email || "Email"} | {resume.phone || "Phone"}</p>
          <p>{resume.linkedin || "LinkedIn"}</p>
        </div>

        <Section title="Skills" content={resume.skills} color={headerColor} />
        <Section title="Education" content={resume.education} color={headerColor} />
        <Section title="Projects" content={resume.projects} color={headerColor} />
        <Section title="Experience" content={resume.experience} color={headerColor} />
      </div>
    </main>
  );
}

function Section({
  title,
  content,
  color,
}: {
  title: string;
  content: string;
  color: string;
}) {
  return (
    <section style={{ marginTop: "20px" }}>
      <h2 style={{ borderBottom: `2px solid ${color}` }}>{title}</h2>
      <p style={{ whiteSpace: "pre-line" }}>
        {content || `${title} will appear here`}
      </p>
    </section>
  );
}
=======
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
>>>>>>> b8026ba (Initial commit from Create Next App)
