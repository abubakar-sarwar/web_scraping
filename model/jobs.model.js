import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  companyName: { type: String, required: true },
  companyLogo: { type: String },
  salary: {
    per: { type: String },
    min: { type: Number },
    max: { type: Number },
  },
  vacancies: { type: Number, default: 1 },
  deadline: { type: Date },
  type: { type: String },
  experience: { type: Object },
  skills: { type: [String] },
  education: { type: Object },
  jobPostedAt: { type: Date },
  industry: { type: String },
  gender: { type: String },
  location: {
    country: { type: String },
    city: { type: String },
  },
  nationality: { type: String },
  workplaceType: { type: String, enum: ["Remote", "Onsite"] },
  description: { type: String },
  highlights: { type: Object },
  publisher: { type: String },
});

export default mongoose.model("LinkedinJobs", jobSchema);
