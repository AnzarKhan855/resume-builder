import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import AuthModal from "@/src/components/auth/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ResumeForge V2 — Modern ATS Resume Builder & Smart Parser",
    template: "%s | ResumeForge V2",
  },
  description:
    "Build recruiter-approved, ATS-friendly resumes in minutes. Create from scratch or import existing PDF/DOCX files with live preview, multi-section management, and crisp PDF export.",
  keywords: [
    "resume builder",
    "ATS resume",
    "resume parser",
    "import resume PDF",
    "CV maker",
    "professional resume templates",
  ],
  authors: [{ name: "ResumeForge Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://resumeforge.dev",
    title: "ResumeForge V2 — Modern ATS Resume Builder",
    description:
      "Transform your career story into an interview-winning resume. Realtime live preview, smart PDF/DOCX parsing, and 5 ATS-compliant templates.",
    siteName: "ResumeForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeForge V2 — Modern ATS Resume Builder",
    description:
      "Build recruiter-approved, ATS-friendly resumes in minutes. Smart import, drag-and-drop ordering, and live preview.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
