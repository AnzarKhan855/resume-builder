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

  const saveResume = async () => {
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resume),
      });

      if (!response.ok) {
        alert("Failed to save resume");
        return;
      }

      alert("Resume saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
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

        <button
          onClick={saveResume}
          className="w-full rounded bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
        >
          Save Resume
        </button>
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