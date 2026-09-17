import mongoose, { Schema } from "mongoose";

const ResumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Resume",
    },
    template: {
      type: String,
      default: "classic",
    },
    personalInfo: {
      fullName: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      jobTitle: { type: String, default: "" },
      website: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    summary: { type: String, default: "" },
    experience: { type: Schema.Types.Mixed, default: [] },
    education: { type: Schema.Types.Mixed, default: [] },
    projects: { type: Schema.Types.Mixed, default: [] },
    skills: { type: Schema.Types.Mixed, default: [] },
    certifications: { type: Schema.Types.Mixed, default: [] },
    achievements: { type: Schema.Types.Mixed, default: [] },
    languages: { type: Schema.Types.Mixed, default: [] },
    customSections: { type: Schema.Types.Mixed, default: [] },
    sectionOrder: { type: [String], default: [] },
    customization: { type: Schema.Types.Mixed, default: {} },

    // Legacy flat fields kept for complete backwards compatibility
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    linkedin: { type: String, default: "" },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.Resume ||
  mongoose.model("Resume", ResumeSchema);