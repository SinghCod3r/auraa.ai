import mongoose from 'mongoose';
import { User, MentorProfile, OFFICIAL_MENTORS } from '@/models';

const MONGODB_URI = process.env.MONGODB_URI;
// console.log("MONGODB_URI VALUE →", process.env.MONGODB_URI);

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Seed Official Mentors into the database to make them real and functional.
 */
async function seedOfficialMentors() {
    try {
        console.log("Seeding Official Mentors...");
        for (const mentor of OFFICIAL_MENTORS) {
            // 1. Ensure User exists
            let user = await User.findOne({
                $or: [{ clerkId: mentor.clerkId }, { email: mentor.email }]
            });

            if (!user) {
                user = await User.create({
                    clerkId: mentor.clerkId || `clerk-fake-${mentor.id}`,
                    email: mentor.email,
                    name: mentor.name,
                    image: mentor.image?.startsWith("http") ? mentor.image : "",
                    role: "MENTOR"
                });
                console.log(`Created User for: ${mentor.name}`);
            }

            // 2. Ensure MentorProfile exists and is approved
            let profile = await MentorProfile.findOne({ userId: user._id });

            if (!profile) {
                profile = await MentorProfile.create({
                    _id: mentor.id, // Use the fixed ID from JSON
                    userId: user._id,
                    expertise: mentor.expertise,
                    designation: mentor.role,
                    company: mentor.company,
                    hourlyRate: mentor.hourlyRate,
                    averageRating: mentor.rating,
                    totalReviews: mentor.reviews,
                    bio: mentor.bio,
                    isApproved: true
                });
                console.log(`Created MentorProfile for: ${mentor.name}`);
            } else {
                // Update existing profile (optional, keeps it in sync with JSON)
                await MentorProfile.updateOne({ _id: profile._id }, {
                    expertise: mentor.expertise,
                    designation: mentor.role,
                    company: mentor.company,
                    hourlyRate: mentor.hourlyRate,
                    isApproved: true
                });
            }
        }
        console.log("Official Mentors Seeding Complete.");
    } catch (error) {
        console.error("Failed to seed official mentors:", error);
    }
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(process.env.MONGODB_URI!, opts).then(async (mongoose) => {
            // Seed mentors on first connection
            await seedOfficialMentors();
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectToDatabase;
