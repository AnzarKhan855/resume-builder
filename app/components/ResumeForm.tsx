"use client";

export default function ResumeForm() {
  return (
    <div
      style={{
        width: "500px",
        background: "white",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <h1>Resume Builder</h1>

      <input type="text" placeholder="Full Name" />

      <input type="email" placeholder="Email" />

      <input type="text" placeholder="Phone Number" />

      <input type="text" placeholder="LinkedIn URL" />

      <textarea
        placeholder="Skills"
        rows={4}
      />

      <textarea
        placeholder="Education"
        rows={4}
      />

      <textarea
        placeholder="Projects"
        rows={4}
      />

      <textarea
        placeholder="Experience"
        rows={4}
      />

      <button>Generate Resume</button>
    </div>
  );
}