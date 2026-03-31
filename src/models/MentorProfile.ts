import mongoose, { Document, Model } from "mongoose";

export interface IMentorProfile extends Document {
    userId: mongoose.Types.ObjectId;
    expertise: string[];
    bio?: string;
    designation?: string;
    company?: string;
    hourlyRate: number;
    averageRating: number;
    totalReviews: number;
    isApproved: boolean; // Replaces auto-approvals
}

const MentorProfileSchema = new mongoose.Schema<IMentorProfile>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
        expertise: { type: [String], default: [] },
        bio: { type: String },
        designation: { type: String },
        company: { type: String },
        hourlyRate: { type: Number, default: 50 },
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        isApproved: { type: Boolean, default: false } // Default to pending approval
    }
);

export const MentorProfile: Model<IMentorProfile> =
    mongoose.models.MentorProfile || mongoose.model<IMentorProfile>("MentorProfile", MentorProfileSchema);

export const OFFICIAL_MENTORS = [
    {
        id: "660000000000000000000001", // Corrected to 24 chars
        clerkId: "user_3BhgiJrhc9No8EjfNtjqcUlyuV5",
        email: "ayushsinghceee@gmail.com",
        name: "Er. Ayush Singh",
        role: "Technical Consultant",
        company: "Ex Chetu, Ex TSC, Curently Working at Acxiom Consulting",
        location: "UP, India",
        rating: 4.9,
        reviews: 124,
        expertise: ["Node.js", "MongoDB", "React.js", "React Native", "MERN Stack", "Data Structure & Algorithm"],
        image: "https://i.ibb.co/mrNSdRn5/Whats-App-Image-2026-03-30-at-12-37-41-PM.jpg",
        hourlyRate: 150,
        bio: "Specializing in Micro-Services and Three Layer Architecture. Mentored 300+ Students and Helped them to choose right path according to the trend."
    },
    {
        id: "660000000000000000000002", // Corrected to 24 chars
        clerkId: "user_3BhqL2X7eovxSBxGsgASQ1BhAMb",
        email: "sudhanshu1404@gmail.com",
        name: "Sudhanshu Chaudhary",
        role: "UI/UX Engineer",
        company: "Airbnb",
        location: "Surat, India",
        rating: 4.8,
        reviews: 89,
        expertise: ["UX Design", "Figma", "Product Strategy"],
        image: "https://i.ibb.co/tT2jwpY7/Whats-App-Image-2026-03-31-at-2-29-07-PM.jpg",
        hourlyRate: 120,
        bio: "Helping mentees build world-class digital products through design thinking."
    },
    {
        id: "660000000000000000000003", // Corrected to 24 chars
        clerkId: "clerk-marcus",
        email: "razaaun647@gmail.com",
        name: "Aun Raza Khan",
        role: "BDE Lead",
        company: "Ex-Cogent, Ex-Tech Mahindra, ",
        location: "Noida, India",
        rating: 5.0,
        reviews: 215,
        expertise: ["Inspection", "Communication Skill", "Executive"],
        image: "bg-emerald-600",
        hourlyRate: 200,
        bio: "Helpling student to know the Reality of Non-Tech Field and Help them to Grow in the Sales Industry."
    }
];
