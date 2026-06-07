import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import JobPosting from "../src/models/JobPosting";
import Candidate from "../src/models/Candidate";
import PDFDocument from "pdfkit";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
const orgId = "6a2161415b2d4dbff95e7c0c";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function createPDFBuffer(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: any[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    
    // Header
    doc.fontSize(24).font('Helvetica-Bold').text(data.name, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('gray')
       .text(`${data.email}  |  ${data.phone}  |  LinkedIn: linkedin.com/in/${data.name.replace(' ', '').toLowerCase()}`, { align: 'center' });
    
    doc.moveDown(2);
    
    // Professional Summary
    doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('Professional Summary');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').text(data.summary, { align: 'justify' });
    
    doc.moveDown(1.5);
    
    // Skills
    doc.fontSize(14).font('Helvetica-Bold').text('Core Competencies');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').text(data.skills.join(" • "));
    
    doc.moveDown(1.5);
    
    // Experience
    doc.fontSize(14).font('Helvetica-Bold').text('Professional Experience');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.5);
    
    for (const exp of data.experience) {
      doc.fontSize(12).font('Helvetica-Bold').text(exp.role);
      doc.fontSize(10).font('Helvetica-Oblique').fillColor('gray').text(`${exp.company}  |  ${exp.dates}`);
      doc.moveDown(0.2);
      doc.fontSize(11).font('Helvetica').fillColor('black');
      for (const pt of exp.points) {
         doc.text(`•  ${pt}`, { indent: 15 });
      }
      doc.moveDown(0.8);
    }
    
    // Education
    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text(data.education.degree);
    doc.fontSize(11).font('Helvetica').text(data.education.university);
    
    doc.end();
  });
}

async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", public_id: `org_${orgId}/resumes/${filename}` },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    stream.end(buffer);
  });
}

const firstNames = [
  "Amit", "Priya", "Rahul", "Neha", "Rohan", "Sneha", "Karan", "Anjali", "Siddharth", "Tanvi",
  "Vikram", "Aditi", "Manish", "Divya", "Sanjay", "Ritu", "Rajesh", "Kiran", "Vijay", "Pooja",
  "Arjun", "Meera", "Yash", "Kavita", "Deepak", "Aisha", "Harish", "Preeti", "Anil", "Geeta",
  "Suresh", "Sunita", "Ramesh", "Lata", "Dinesh", "Usha", "Naresh", "Rekha", "Mahesh", "Sita"
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Jain", "Mehta", "Shah", "Patel", "Reddy", "Nair", "Rao",
  "Singh", "Kumar", "Choudhury", "Das", "Banerjee", "Chatterjee", "Mishra", "Pandey", "Dubey", "Joshi",
  "Saxena", "Srivastava", "Deshmukh", "Kulkarni", "Patil", "Bose", "Sen", "Roy", "Dutta", "Ghosh",
  "Malhotra", "Kapoor", "Anand", "Gill", "Bhatia", "Sodhi", "Menon", "Pillai", "Iyer", "Iyengar"
];

const roles = ["Software Engineer", "Backend Developer", "Frontend Developer", "Full Stack Engineer", "DevOps Engineer", "Data Scientist", "Product Manager", "UI/UX Designer", "Marketing Manager", "QA Automation Engineer"];

async function processCandidate(index: number, jobs: any[]) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
  const phone = `+91 9${Math.floor(Math.random() * 900000000) + 100000000}`;
  
  const allSkills = ["React", "TypeScript", "Node.js", "MongoDB", "Express", "Tailwind CSS", "Next.js", "Redux Toolkit", "Docker", "AWS", "GraphQL", "PostgreSQL", "Python", "Kubernetes", "Figma", "Jira", "SEO", "Machine Learning", "Data Analysis", "Go", "Rust", "Java", "Spring Boot"];
  const skills = allSkills.sort(() => 0.5 - Math.random()).slice(0, 5 + Math.floor(Math.random() * 3));
  
  const assignedJob = jobs[index % jobs.length];
  const candidateRole = roles[Math.floor(Math.random() * roles.length)];

  const resumeData = {
    name,
    email,
    phone,
    summary: `A highly motivated and results-driven ${candidateRole} with experience in building scalable solutions. Proficient in modern technologies and passionate about creating intuitive experiences. Proven track record of collaborating with cross-functional teams to deliver high-quality products on time.`,
    skills,
    experience: [
      {
        role: candidateRole,
        company: ["Tech Solutions Inc.", "Global Innovators", "Startup Hub", "Fintech Pioneers", "Cloud Networks"][Math.floor(Math.random() * 5)],
        dates: "2021 - Present",
        points: [
          "Spearheaded the development of key platform features, improving overall efficiency by 30%.",
          `Implemented scalable architectures to support a growing user base of over 100,000 active users.`,
          "Collaborated closely with stakeholders to ensure alignment with business objectives."
        ]
      },
      {
        role: `Junior ${candidateRole}`,
        company: ["Local Devs LLC", "NextGen Systems", "Creative Agency", "Alpha Technologies"][Math.floor(Math.random() * 4)],
        dates: "2018 - 2021",
        points: [
          "Assisted in migrating legacy applications to modern architectures, reducing maintenance costs by 20%.",
          "Wrote extensive unit and integration tests, achieving 90% test coverage.",
          "Participated in daily stand-ups and sprint planning as part of an Agile development team."
        ]
      }
    ],
    education: {
      degree: ["Bachelor of Science in Computer Science", "Master of Science in Information Technology", "B.E. Electronics and Communication", "B.Tech Information Technology"][Math.floor(Math.random() * 4)],
      university: ["National Institute of Technology", "Indian Institute of Technology", "Delhi University", "Anna University", "Mumbai University"][Math.floor(Math.random() * 5)]
    }
  };
  
  const pdfBuffer = await createPDFBuffer(resumeData);
  let resumeUrl = "";
  try {
    resumeUrl = await uploadToCloudinary(pdfBuffer, `candidate_bulk_${Date.now()}_${index}.pdf`);
  } catch (e) {
    resumeUrl = `https://res.cloudinary.com/demo/image/upload/sample.pdf`;
  }

  const candidate = new Candidate({
    orgId,
    jobId: assignedJob._id,
    name,
    email,
    phone,
    resumeUrl,
    stage: "applied",
    isAiScreened: false,
    matchScore: 0,
    skills,
  });
  await candidate.save();
  return candidate;
}

async function run() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB.");

  // First get all jobs and candidates for same orgId
  const existingJobs = await JobPosting.countDocuments({ orgId });
  const existingCandidates = await Candidate.countDocuments({ orgId });
  console.log(`Currently there are ${existingJobs} jobs and ${existingCandidates} candidates for org ${orgId}.`);

  // Add 5 more jobs
  const newJobs = [
    { title: "Senior DevOps Engineer", department: "Engineering", location: "Remote", type: "Full-time", description: "Looking for an experienced DevOps engineer to scale our infrastructure.", requirements: ["AWS", "Kubernetes", "Docker", "CI/CD", "Terraform"], status: "active" },
    { title: "Product Manager", department: "Product", location: "New York", type: "Full-time", description: "Seeking a data-driven product manager to lead our core product initiatives.", requirements: ["Agile", "Jira", "Product Strategy", "Data Analysis", "A/B Testing"], status: "active" },
    { title: "UX/UI Designer", department: "Design", location: "Remote", type: "Full-time", description: "Creative designer needed to overhaul our user interfaces.", requirements: ["Figma", "Sketch", "Prototyping", "User Research", "Wireframing"], status: "active" },
    { title: "Data Scientist", department: "Data", location: "San Francisco", type: "Full-time", description: "Data Scientist with machine learning expertise for predictive analytics.", requirements: ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas"], status: "active" },
    { title: "Marketing Specialist", department: "Marketing", location: "Remote", type: "Contract", description: "Growth marketing specialist focused on digital acquisition channels.", requirements: ["SEO", "Content Strategy", "Google Analytics", "Social Media", "Email Marketing"], status: "active" }
  ];

  for (const jobData of newJobs) {
    const job = new JobPosting({ orgId, ...jobData });
    await job.save();
    console.log(`Created new job post: ${job.title}`);
  }

  const allJobs = await JobPosting.find({ orgId });
  console.log(`Now there are ${allJobs.length} total jobs for org ${orgId}.`);

  // Generate 100 total candidates (20 + 30 + 50)
  const totalCandidates = 100;
  console.log(`Creating ${totalCandidates} candidates divided among all jobs. This will upload ${totalCandidates} PDFs...`);

  // Process in batches of 10 to avoid overwhelming Cloudinary / MongoDB
  for (let batch = 0; batch < totalCandidates / 10; batch++) {
    const batchPromises = [];
    for (let i = 0; i < 10; i++) {
       const globalIndex = batch * 10 + i;
       if (globalIndex >= totalCandidates) break;
       batchPromises.push(processCandidate(globalIndex, allJobs));
    }
    await Promise.all(batchPromises);
    console.log(`Batch ${batch + 1}/${totalCandidates / 10} completed (${(batch + 1) * 10} candidates inserted).`);
  }

  await mongoose.disconnect();
  console.log("Done seeding bulk realistic mock data.");
}

run().catch(console.error);
