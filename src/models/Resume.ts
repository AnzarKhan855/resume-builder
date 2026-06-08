import mongoose, { Schema } from "mongoose";

const ResumeSchema = new Schema(
  {
    name: String,
    email: String,
    phone: String,
    linkedin: String,
    skills: String,
    education: String,
    projects: String,
    experience: String,
  },
  { timestamps: true }
);

export default mongoose.models.Resume ||
  mongoose.model("Resume", ResumeSchema);