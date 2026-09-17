"use client";

import React, { useState } from "react";
import { SkillItem } from "@/src/types/resume";
import { Plus, X, Sparkles } from "lucide-react";
import { generateId } from "@/src/lib/resume-normalizer";

interface SectionSkillsProps {
  skills: SkillItem[];
  onChange: (skills: SkillItem[]) => void;
}

const POPULAR_SKILLS = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "AWS",
  "Git",
  "Tailwind CSS",
  "GraphQL",
  "REST APIs",
  "Agile",
];

export default function SectionSkills({ skills, onChange }: SectionSkillsProps) {
  const [newSkillName, setNewSkillName] = useState("");
  const [category, setCategory] = useState("Technical");

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSkillName.trim()) return;

    const names = newSkillName
      .split(/[,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const newItems: SkillItem[] = names.map((name) => ({
      id: generateId(),
      name,
      category,
      level: "Advanced",
    }));

    onChange([...skills, ...newItems]);
    setNewSkillName("");
  };

  const handleQuickAdd = (skillName: string) => {
    if (skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) return;
    onChange([
      ...skills,
      {
        id: generateId(),
        name: skillName,
        category: "Technical",
        level: "Advanced",
      },
    ]);
  };

  const handleRemoveSkill = (id: string) => {
    onChange(skills.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-sm font-bold text-slate-900">Skills & Competencies</h3>
        <p className="text-xs text-slate-500">
          Add relevant keywords to help your resume pass through Applicant Tracking Systems (ATS).
        </p>
      </div>

      {/* Add Skill Bar */}
      <form onSubmit={handleAddSkill} className="flex gap-2">
        <input
          type="text"
          placeholder="Add skills (e.g. React, Node.js, Leadership)..."
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          className="grow px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white"
        >
          <option value="Technical">Technical</option>
          <option value="Languages">Languages</option>
          <option value="Frameworks">Frameworks</option>
          <option value="Tools">Tools</option>
          <option value="Soft Skills">Soft Skills</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {/* Quick Suggestions */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>One-Click Suggested Skills</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SKILLS.filter(
            (p) => !skills.some((s) => s.name.toLowerCase() === p.toLowerCase())
          ).map((skillName) => (
            <button
              key={skillName}
              type="button"
              onClick={() => handleQuickAdd(skillName)}
              className="text-xs px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg transition font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-slate-400" />
              {skillName}
            </button>
          ))}
        </div>
      </div>

      {/* Current Skills List */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Active Skills ({skills.length})
        </label>
        {skills.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 italic">
            No skills added yet. Add some above to increase your match rate.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/60 transition group"
              >
                <span>{skill.name}</span>
                <span className="text-[10px] text-blue-500 font-normal">({skill.category})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-blue-400 hover:text-red-500 transition"
                  title="Remove skill"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
