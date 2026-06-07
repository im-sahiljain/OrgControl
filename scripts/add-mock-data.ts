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
  "Vikram", "Aditi", "Manish", "Divya", "Sanjay", "Ritu", "Rajesh", "Kiran", "Vijay", "Pooja"
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Jain", "Mehta", "Shah", "Patel", "Reddy", "Nair", "Rao",
  "Singh", "Kumar", "Choudhury", "Das", "Banerjee", "Chatterjee", "Mishra", "Pandey", "Dubey", "Joshi"
];

async function run() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB.");

  // Delete previously generated candidates with example.com emails to clean up the bad mock ones
  const deleted = await Candidate.deleteMany({ email: /example\.com$/ });
  console.log(`Deleted ${deleted.deletedCount} old candidates from earlier runs.`);

  // Get all jobs for this org
  const allJobs = await JobPosting.find({ orgId });
  console.log(`Found ${allJobs.length} jobs for org ${orgId}.`);

  // Create 10 candidates
  for (let i = 0; i < 10; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
    const phone = `+91 9${Math.floor(Math.random() * 900000000) + 100000000}`;
    const skillsPool = ["React", "TypeScript", "Node.js", "MongoDB", "Express", "Tailwind CSS", "Next.js", "Redux Toolkit", "Docker", "AWS", "GraphQL", "PostgreSQL"];
    const skills = skillsPool.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    const resumeData = {
      name,
      email,
      phone,
      summary: `A highly motivated and results-driven Software Engineer with experience in building scalable web applications. Proficient in modern JavaScript frameworks and passionate about creating intuitive user experiences. Proven track record of collaborating with cross-functional teams to deliver high-quality products on time.`,
      skills,
      experience: [
        {
          role: "Software Engineer",
          company: "Tech Solutions Inc.",
          dates: "2022 - Present",
          points: [
            "Spearheaded the development of a real-time dashboard using React and WebSockets, improving data visibility by 40%.",
            `Implemented scalable RESTful APIs in Node.js and Express to support a growing user base of over 50,000 active users.`,
            "Collaborated closely with the design team to ensure pixel-perfect implementation of UI mockups."
          ]
        },
        {
          role: "Junior Web Developer",
          company: "Innovative Startups LLC",
          dates: "2020 - 2022",
          points: [
            "Assisted in migrating legacy jQuery applications to modern React architectures, reducing page load times by 30%.",
            "Wrote unit and integration tests using Jest and React Testing Library, achieving 85% test coverage.",
            "Participated in daily stand-ups and sprint planning as part of an Agile development team."
          ]
        }
      ],
      education: {
        degree: "Bachelor of Science in Computer Science",
        university: "National Institute of Technology"
      }
    };
    
    console.log(`Generating professional PDF for ${name}...`);
    const pdfBuffer = await createPDFBuffer(resumeData);
    
    console.log(`Uploading PDF for ${name} to Cloudinary...`);
    let resumeUrl = "";
    try {
      resumeUrl = await uploadToCloudinary(pdfBuffer, `candidate_v2_${Date.now()}_${i}.pdf`);
      console.log(`Uploaded: ${resumeUrl}`);
    } catch (e) {
      console.error("Cloudinary upload failed, using fallback URL. Error:", e);
      resumeUrl = `https://res.cloudinary.com/demo/image/upload/sample.pdf`;
    }
    
    // Assign to a job post sequentially to divide them evenly
    const assignedJob = allJobs[i % allJobs.length];

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
    console.log(`Created professional application for ${name} applied to ${assignedJob.title}`);
  }

  await mongoose.disconnect();
  console.log("Done seeding realistic mock data.");
}

run().catch(console.error);
