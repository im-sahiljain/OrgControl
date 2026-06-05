import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import JobPosting from "../src/models/JobPosting";
import Candidate from "../src/models/Candidate";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is missing.");
  process.exit(1);
}

const orgId = "6a2161415b2d4dbff95e7c0c";
const jobIds = ["6a216a031c4e3e1cda3a58e6", "6a216a031c4e3e1cda3a58e5"];
const resumeUrl =
  "https://res.cloudinary.com/dagkrnoap/image/upload/v1780645337/org-control/org_6a2161415b2d4dbff95e7c0c/job_6a216a031c4e3e1cda3a58e6/resumes/ujw30liisgdztxscdozv.pdf";

const firstNames = [
  "Amit",
  "Priya",
  "Rahul",
  "Neha",
  "Rohan",
  "Sneha",
  "Karan",
  "Anjali",
  "Siddharth",
  "Tanvi",
  "Vikram",
  "Aditi",
  "Manish",
  "Divya",
  "Sanjay",
  "Ritu",
  "Rajesh",
  "Kiran",
  "Vijay",
  "Pooja",
  "Abhishek",
  "Shweta",
  "Arjun",
  "Meera",
  "Yash",
  "Kavita",
  "Deepak",
  "Aisha",
  "Harish",
  "Preeti",
  "Anil",
  "Geeta",
  "Suresh",
  "Sunita",
  "Ramesh",
  "Lata",
  "Dinesh",
  "Usha",
  "Naresh",
  "Rekha",
  "Mahesh",
  "Sita",
  "Kamlesh",
  "Maya",
  "Raj",
  "Kusum",
  "Manoj",
  "Saroj",
  "Sandeep",
  "Jyoti",
];

const lastNames = [
  "Sharma",
  "Verma",
  "Gupta",
  "Jain",
  "Mehta",
  "Shah",
  "Patel",
  "Reddy",
  "Nair",
  "Rao",
  "Singh",
  "Kumar",
  "Choudhury",
  "Das",
  "Banerjee",
  "Chatterjee",
  "Mishra",
  "Pandey",
  "Dubey",
  "Joshi",
  "Saxena",
  "Srivastava",
  "Deshmukh",
  "Kulkarni",
  "Patil",
  "Bose",
  "Sen",
  "Roy",
  "Dutta",
  "Ghosh",
  "Malhotra",
  "Kapoor",
  "Anand",
  "Gill",
  "Bhatia",
  "Sodhi",
  "Menon",
  "Pillai",
  "Iyer",
  "Iyengar",
  "Rathore",
  "Shekhawat",
  "Chauhan",
  "Solanki",
  "Grover",
  "Taneja",
  "Wadhwa",
  "Bahl",
  "Khanna",
  "Chopra",
];

const commonSkills = [
  "React",
  "TypeScript",
  "Redux",
  "Node.js",
  "Express",
  "MongoDB",
  "REST APIs",
  "Git",
  "Jest",
  "Tailwind CSS",
  "Next.js",
  "Docker",
  "AWS",
  "SQL",
];

async function run() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected.");

    for (const jobId of jobIds) {
      const job = await JobPosting.findById(jobId);
      if (!job) {
        console.warn(`Job posting with ID ${jobId} not found, skipping.`);
        continue;
      }
      console.log(
        `Generating 2000 applications for Job: ${job.title} (${jobId})...`,
      );

      const candidatesToInsert = [];

      for (let i = 0; i < 2000; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[(i * 3) % lastNames.length];
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example-recruiting.com`;
        const phone = `+91 9${(987654321 - i * 17923).toString().substring(0, 9)}`;
        const matchScore = Math.floor(Math.random() * (96 - 50 + 1)) + 50;

        // pick 4 random skills
        const skills: string[] = [];
        for (let s = 0; s < 4; s++) {
          const randomSkill =
            commonSkills[Math.floor(Math.random() * commonSkills.length)];
          if (!skills.includes(randomSkill) && skills.length < 4) {
            skills.push(randomSkill);
          }
        }

        candidatesToInsert.push({
          orgId,
          jobId,
          name,
          email,
          phone,
          resumeUrl,
          stage: "applied",
          isAiScreened: true,
          matchScore,
          skills,
          summary: `${name} is a qualified candidate applying for ${job.title}. Screened with automated recruiter pipeline.`,
          pros: [
            `Demonstrated skill competency in ${skills.slice(0, 2).join(", ")}.`,
            "Strong communication index based on candidate overview.",
            "Relevant industry background align with open role specs.",
          ],
          cons: [
            "Requires initial technical assessment confirmation.",
            "Salary expectation alignment pending HR interview.",
          ],
          interviewQuestions: [
            {
              question: `Can you walk us through a recent project where you utilized ${skills[0] || "React"}?`,
              focusArea: "Technical Depth",
            },
            {
              question:
                "What is your preferred development methodology in a distributed remote team?",
              focusArea: "Behavioral",
            },
          ],
        });
      }

      await Candidate.insertMany(candidatesToInsert);
      console.log(
        `Inserted ${candidatesToInsert.length} applications for jobId ${jobId} successfully.`,
      );
    }
  } catch (error) {
    console.error("Error seeding bulk applications:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
}

run();
