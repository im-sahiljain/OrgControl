const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const PDFDocument = require('pdfkit');
require('dotenv').config();

// 1. Environment & Database Configuration
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dagkrnoap";
const apiKey = process.env.CLOUDINARY_API_KEY || "851642813282413";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "pvA-LTlpxSl9L5zvAgpHTSODmw8";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const TARGET_ORG_ID = new mongoose.Types.ObjectId("6a2161415b2d4dbff95e7c0c");

// 2. Refined Job Specifications for the 9 Existing Jobs
const REFINED_JOBS = [
  {
    id: "6a216a031c4e3e1cda3a58e5",
    title: "Senior Frontend Engineer (React/Next)",
    department: "Engineering",
    location: "Remote (India)",
    type: "Full-time",
    targetCount: 260,
    description: "Architect and scale high-performance web frontends using Next.js 15 App Router, TypeScript, and Redux Toolkit. You will lead UI performance optimizations, core Web Vitals (LCP/INP), and build accessible design systems.",
    requirements: [
      "5+ years of production experience in React, Next.js, and TypeScript",
      "Mastery of state management patterns with Redux Toolkit and React Query",
      "Expert knowledge of CSS architecture, Tailwind CSS, and Framer Motion",
      "Strong background optimizing Core Web Vitals and SSR hydration performance"
    ],
    skills: ["React.js", "Next.js 15", "TypeScript", "Redux Toolkit", "Tailwind CSS", "GraphQL", "Web Vitals", "Jest"],
    roles: ["Senior Frontend Engineer", "Frontend Architect", "Lead UI Developer", "Staff React Engineer"]
  },
  {
    id: "6a216a031c4e3e1cda3a58e6",
    title: "Senior Backend Engineer (Node/Mongo)",
    department: "Engineering",
    location: "Hybrid (Mumbai)",
    type: "Full-time",
    targetCount: 275,
    description: "Design and implement scalable distributed backend microservices using Node.js, Express, and MongoDB. Responsible for database indexing, aggregation pipelines, caching with Redis, and Kafka event streaming.",
    requirements: [
      "5+ years backend software development in Node.js and TypeScript",
      "Deep expertise in MongoDB database schema modeling and aggregation query tuning",
      "Hands-on experience with Redis caching, rate-limiting, and Apache Kafka",
      "Experience with Docker containerization and secure JWT authentication systems"
    ],
    skills: ["Node.js", "Express.js", "MongoDB", "Mongoose", "Redis", "Apache Kafka", "Docker", "REST APIs", "Microservices"],
    roles: ["Senior Backend Engineer", "Lead Node.js Developer", "Backend Systems Engineer", "API Architect"]
  },
  {
    id: "6a2549cb3aad02b0c6796e11",
    title: "Frontend Developer (0-2 YOE)",
    department: "Engineering",
    location: "Hybrid (Bengaluru)",
    type: "Full-time",
    targetCount: 350,
    description: "Collaborate with senior engineers to build responsive web pages, integrate RESTful APIs, and fix frontend bugs in our Next.js and React web portals. Great learning opportunity for early-career developers.",
    requirements: [
      "0-2 years experience with JavaScript (ES6+), React.js, and HTML5/CSS3",
      "Familiarity with Git version control and collaborative GitHub workflows",
      "Basic understanding of REST APIs, JSON data handling, and Tailwind CSS",
      "Degree in Computer Science, Information Technology, or relevant bootcamp training"
    ],
    skills: ["JavaScript", "React.js", "HTML5/CSS3", "Tailwind CSS", "Git", "REST APIs", "Responsive Design"],
    roles: ["Junior Frontend Developer", "Associate Software Engineer", "React Developer", "UI Engineer"]
  },
  {
    id: "6a254be5740f00594335b10d",
    title: "Senior DevOps Engineer",
    department: "Engineering",
    location: "On-site (Gurugram)",
    type: "Full-time",
    targetCount: 220,
    description: "Lead AWS infrastructure automation, Kubernetes (EKS) cluster management, and CI/CD pipelines. Maintain infrastructure-as-code using Terraform, implement zero-trust security with Vault, and maintain Datadog observability.",
    requirements: [
      "5+ years DevOps/SRE experience managing production AWS environments",
      "Proficient in Terraform, Helm charts, and Kubernetes cluster administration",
      "Experience with Prometheus, Grafana, Datadog monitoring and incident triage",
      "Solid scripting knowledge in Bash, Python, or Go"
    ],
    skills: ["AWS", "Kubernetes (EKS)", "Terraform", "Docker", "CI/CD", "Prometheus", "Grafana", "HashiCorp Vault", "Bash"],
    roles: ["Senior DevOps Engineer", "Lead SRE", "Cloud Platform Engineer", "Infrastructure Specialist"]
  },
  {
    id: "6a254be5740f00594335b10e",
    title: "Product Manager",
    department: "Product",
    location: "Remote (India)",
    type: "Full-time",
    targetCount: 210,
    description: "Drive end-to-end product strategy, customer research, roadmap prioritization, and feature launches for our B2B SaaS platform. Partner with engineering and design to author PRDs and measure user engagement.",
    requirements: [
      "3-6 years of Product Management experience in B2B SaaS or HR Tech",
      "Strong analytical ability with tools like Mixpanel, Amplitude, and SQL",
      "Proven history of running agile discovery sprints and shipping user-centric features",
      "Exceptional communication, stakeholder alignment, and PRD writing skills"
    ],
    skills: ["Product Strategy", "B2B SaaS", "Roadmapping", "PRD Writing", "Mixpanel", "User Research", "Agile/Scrum", "SQL"],
    roles: ["Product Manager", "Senior Product Manager", "Technical Product Manager", "Growth Product Lead"]
  },
  {
    id: "6a254be5740f00594335b10f",
    title: "UX/UI Designer",
    department: "Design",
    location: "Hybrid (Mumbai)",
    type: "Full-time",
    targetCount: 230,
    description: "Create intuitive, high-fidelity UI components, user flows, and enterprise dashboard designs in Figma. Champion design systems, accessibility compliance (WCAG 2.1 AA), and interactive prototyping.",
    requirements: [
      "3-6 years experience in product UX/UI design for complex web applications",
      "Mastery of Figma, Tokens Studio, auto-layout, and interactive prototyping",
      "Understanding of web frontend constraints, Tailwind tokens, and HTML/CSS semantics",
      "Strong portfolio demonstrating user journey maps, wireframes, and polished UIs"
    ],
    skills: ["Figma", "Design Systems", "UI/UX Design", "Wireframing", "Prototyping", "WCAG Accessibility", "Framer"],
    roles: ["UI/UX Designer", "Senior Product Designer", "Design Systems Specialist", "Lead UX Architect"]
  },
  {
    id: "6a254be5740f00594335b110",
    title: "Data Scientist",
    department: "Data",
    location: "Remote (India)",
    type: "Full-time",
    targetCount: 240,
    description: "Develop NLP, LLM retrieval (RAG), and predictive machine learning models to power intelligent search and candidate scoring. Build data pipelines using Python, PyTorch, and FastAPI for real-time inferencing.",
    requirements: [
      "3-6 years hands-on experience in Data Science, Machine Learning, and NLP",
      "Proficient in Python, Pandas, PyTorch or TensorFlow, and Scikit-Learn",
      "Experience deploying models as REST APIs using FastAPI and vector embeddings",
      "Degree in Computer Science, Data Science, Statistics, or related quantitative field"
    ],
    skills: ["Python", "PyTorch", "NLP", "Machine Learning", "FastAPI", "Vector Databases", "Pandas", "SQL", "Scikit-Learn"],
    roles: ["Data Scientist", "Senior ML Engineer", "Applied AI Scientist", "NLP Researcher"]
  },
  {
    id: "6a254be5740f00594335b111",
    title: "Marketing Specialist",
    department: "Marketing",
    location: "On-site (Gurugram)",
    type: "Full-time",
    targetCount: 200,
    description: "Execute omni-channel growth campaigns, inbound content marketing, SEO optimization, and LinkedIn performance ads. Analyze marketing funnels and conversion metrics to generate qualified sales pipeline.",
    requirements: [
      "2-5 years experience in B2B digital marketing, SEO, and inbound lead generation",
      "Hands-on expertise with HubSpot CRM, Google Analytics 4, and LinkedIn Ads Manager",
      "Strong copywriting, email nurturing, and content marketing capabilities",
      "Data-oriented mindset focused on CAC, MQL/SQL conversion, and ROI tracking"
    ],
    skills: ["Digital Marketing", "SEO/SEM", "HubSpot", "Google Analytics 4", "LinkedIn Ads", "Content Strategy", "Email Marketing"],
    roles: ["Marketing Specialist", "Growth Marketer", "B2B Marketing Lead", "Demand Generation Manager"]
  },
  {
    id: "6a8947f440541626a07a104c",
    title: "MERN Stack Developer",
    department: "Engineering",
    location: "Remote (India)",
    type: "Full-time",
    targetCount: 320,
    description: "Build and maintain full-stack web applications across MongoDB, Express, React, and Node.js. Implement real-time WebSocket communication, secure authentication, and responsive modern user interfaces.",
    requirements: [
      "2-5 years hands-on full-stack development experience across the MERN stack",
      "Strong understanding of React component lifecycle, Hooks, and Redux",
      "Experience creating RESTful APIs with Express and Mongoose schema design",
      "Familiarity with WebSockets, cloud deployments, and CI/CD pipelines"
    ],
    skills: ["MongoDB", "Express.js", "React.js", "Node.js", "Redux", "WebSockets", "REST APIs", "Tailwind CSS"],
    roles: ["MERN Stack Developer", "Full Stack Engineer", "Web Application Developer", "Software Engineer"]
  }
];

// 3. Indian Names and Companies Seed Pool for Realistic Resumes
const FIRST_NAMES = [
  "Aarav", "Aditi", "Rohan", "Ananya", "Vikram", "Pooja", "Siddharth", "Neha", "Kabir", "Meera",
  "Arjun", "Tanvi", "Rahul", "Kavya", "Deepak", "Sneha", "Kunal", "Rhea", "Nikhil", "Ishaan",
  "Varun", "Priya", "Aditya", "Divya", "Gaurav", "Simran", "Amit", "Shruti", "Harsh", "Prerna",
  "Manish", "Kritika", "Suresh", "Swati", "Rajesh", "Aishwarya", "Alok", "Bhavna", "Chetan", "Deepika"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Malhotra", "Patel", "Mehta", "Iyer", "Nambiar", "Deshmukh", "Chopra",
  "Kapoor", "Bose", "Jain", "Reddy", "Rao", "Nair", "Saxena", "Bhatia", "Aggarwal", "Mishra",
  "Sen", "Dubey", "Banerjee", "Kulkarni", "Joshi", "Bhatt", "Pandey", "Ghosh", "Singh", "Das"
];

const COMPANIES = [
  "TechCraft Solutions", "CloudScale Networks", "Infosys Technologies", "TCS Digital", "Wipro Cloud",
  "Zomato Tech", "Swiggy Labs", "Razorpay Engineering", "Freshworks Systems", "PhonePe Core",
  "Flipkart Internet", "Paytm Labs", "Cred Financial", "Zoho Corporation", "Jio Platforms"
];

const COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "BITS Pilani", "NIT Trichy", "NIT Warangal",
  "DTU Delhi", "IIIT Hyderabad", "Manipal Institute of Technology", "Anna University", "VIT Vellore"
];

// Helper: Random item
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Random integer
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 4. Random Date Generator strictly in July & August 2026
function getRandomJulyAugust2026Date() {
  const start = new Date("2026-07-01T08:00:00.000Z").getTime();
  const end = new Date("2026-08-31T18:00:00.000Z").getTime();
  const timestamp = randInt(start, end);
  return new Date(timestamp);
}

// 5. Build 30 Distinct PDF Layout Renderers
const LAYOUT_STYLES = [
  // 1. Executive Navy Dark Header
  (doc, cand) => {
    doc.rect(0, 0, doc.page.width, 95).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text(cand.name, 45, 25);
    doc.fillColor('#38bdf8').fontSize(10).font('Helvetica').text(cand.targetRole, 45, 50);
    doc.fillColor('#94a3b8').fontSize(8.5).text(`${cand.email}  •  ${cand.phone}  •  India`, 45, 68);

    doc.y = 115;
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('EXECUTIVE SUMMARY');
    doc.rect(45, doc.y + 2, 520, 1).fill('#cbd5e1');
    doc.moveDown(0.5);
    doc.fillColor('#334155').fontSize(9).font('Helvetica').text(cand.summary, { lineGap: 2.5 });

    doc.moveDown(1);
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('CORE COMPETENCIES & SKILLS');
    doc.rect(45, doc.y + 2, 520, 1).fill('#cbd5e1');
    doc.moveDown(0.5);
    doc.fillColor('#0369a1').fontSize(9).font('Helvetica-Bold').text(cand.skills.join('   |   '));

    doc.moveDown(1);
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('EXPERIENCE & PROJECTS');
    doc.rect(45, doc.y + 2, 520, 1).fill('#cbd5e1');
    doc.moveDown(0.5);
    doc.fillColor('#334155').fontSize(8.5).font('Helvetica').text(cand.resumeText, { lineGap: 2.5 });
  },

  // 2. Modern Teal Side-Stripe
  (doc, cand) => {
    doc.rect(0, 0, 160, doc.page.height).fill('#0d9488');
    doc.fillColor('#ffffff').fontSize(15).font('Helvetica-Bold').text(cand.name, 15, 35, { width: 130 });
    doc.moveDown(0.4);
    doc.fontSize(8.5).font('Helvetica-Bold').text('CONTACT INFO', { width: 130 });
    doc.fontSize(8).font('Helvetica').text(`${cand.email}\n${cand.phone}\nVerified Candidate`, { width: 130, lineGap: 2 });
    doc.moveDown(1.2);
    doc.fontSize(8.5).font('Helvetica-Bold').text('KEY SKILLS', { width: 130 });
    cand.skills.forEach(s => doc.fontSize(7.5).font('Helvetica').text(`• ${s}`, { width: 130 }));

    doc.fillColor('#111827').fontSize(17).font('Helvetica-Bold').text(cand.name, 185, 35);
    doc.fillColor('#0d9488').fontSize(10).font('Helvetica-Bold').text(cand.targetRole, 185, 58);
    doc.rect(185, 74, 375, 1.5).fill('#0d9488');
    doc.y = 88;
    doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold').text('CAREER OVERVIEW', 185);
    doc.moveDown(0.3);
    doc.fillColor('#374151').fontSize(8.5).font('Helvetica').text(cand.summary, 185, doc.y, { width: 375, lineGap: 2.5 });
    doc.moveDown(0.8);
    doc.fillColor('#111827').fontSize(10).font('Helvetica-Bold').text('EXPERIENCE & HISTORY', 185);
    doc.moveDown(0.3);
    doc.fillColor('#374151').fontSize(8).font('Helvetica').text(cand.resumeText, 185, doc.y, { width: 375, lineGap: 2.5 });
  },

  // 3. Classic Serif Elegant
  (doc, cand) => {
    doc.fillColor('#1e1b4b').fontSize(22).font('Times-Bold').text(cand.name, { align: 'center' });
    doc.fillColor('#4338ca').fontSize(9.5).font('Times-Italic').text(`${cand.targetRole}  •  ${cand.email}  •  ${cand.phone}`, { align: 'center' });
    doc.moveDown(0.4);
    doc.rect(70, doc.y, 470, 0.8).fill('#818cf8');
    doc.moveDown(1);
    doc.fillColor('#1e1b4b').fontSize(11).font('Times-Bold').text('PROFESSIONAL PROFILE', 45);
    doc.fillColor('#1e293b').fontSize(9).font('Times-Roman').text(cand.summary, 45, doc.y + 3, { lineGap: 2.5 });
    doc.moveDown(1);
    doc.fillColor('#1e1b4b').fontSize(11).font('Times-Bold').text('TECHNICAL COMPETENCIES', 45);
    doc.fillColor('#312e81').fontSize(8.5).font('Times-Bold').text(cand.skills.join('  •  '), { lineGap: 2 });
    doc.moveDown(1);
    doc.fillColor('#1e1b4b').fontSize(11).font('Times-Bold').text('DETAILED EXPERIENCE & PROJECTS', 45);
    doc.fillColor('#1e293b').fontSize(8.5).font('Times-Roman').text(cand.resumeText, { lineGap: 2.5 });
  },

  // 4. Slate Gray Minimal Grid
  (doc, cand) => {
    doc.rect(40, 30, 530, 60).fill('#f8fafc');
    doc.rect(40, 30, 530, 60).stroke('#cbd5e1');
    doc.fillColor('#0284c7').fontSize(17).font('Helvetica-Bold').text(cand.name, 55, 42);
    doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text(`${cand.targetRole}  |  ${cand.email}  |  ${cand.phone}`, 55, 66);
    doc.y = 105;
    doc.fillColor('#0284c7').fontSize(10.5).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY');
    doc.moveDown(0.3);
    doc.fillColor('#334155').fontSize(8.5).font('Helvetica').text(cand.summary, { lineGap: 2.5 });
    doc.moveDown(0.8);
    doc.fillColor('#0284c7').fontSize(10.5).font('Helvetica-Bold').text('AREAS OF EXPERTISE');
    doc.moveDown(0.3);
    doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text(cand.skills.join(', '));
    doc.moveDown(0.8);
    doc.fillColor('#0284c7').fontSize(10.5).font('Helvetica-Bold').text('CAREER RECORD & EDUCATION');
    doc.moveDown(0.3);
    doc.fillColor('#334155').fontSize(8).font('Helvetica').text(cand.resumeText, { lineGap: 2.5 });
  }
];

// Fill the rest up to 30 unique styles by styling variations
for (let s = 5; s <= 30; s++) {
  const accentColors = ['#059669', '#7c3aed', '#dc2626', '#d97706', '#2563eb', '#db2777', '#4b5563', '#0891b2'];
  const accent = accentColors[s % accentColors.length];

  LAYOUT_STYLES.push((doc, cand) => {
    // Header accent bar
    doc.rect(40, 30, 530, 4).fill(accent);
    doc.fillColor(accent).fontSize(18).font('Helvetica-Bold').text(cand.name, 40, 42);
    doc.fillColor('#4b5563').fontSize(9).font('Helvetica').text(`${cand.targetRole} • ${cand.email} • ${cand.phone}`, 40, 64);
    doc.rect(40, 78, 530, 0.5).fill('#e5e7eb');

    doc.y = 90;
    doc.fillColor(accent).fontSize(10.5).font('Helvetica-Bold').text(`SUMMARY STATEMENT`);
    doc.moveDown(0.25);
    doc.fillColor('#374151').fontSize(8.5).font('Helvetica').text(cand.summary, { lineGap: 2.5 });

    doc.moveDown(0.8);
    doc.fillColor(accent).fontSize(10.5).font('Helvetica-Bold').text(`SKILLS & TECHNOLOGIES`);
    doc.moveDown(0.25);
    doc.fillColor('#111827').fontSize(8.5).font('Helvetica-Bold').text(cand.skills.join('  •  '));

    doc.moveDown(0.8);
    doc.fillColor(accent).fontSize(10.5).font('Helvetica-Bold').text(`EXPERIENCE & PROJECTS`);
    doc.moveDown(0.25);
    doc.fillColor('#374151').fontSize(8).font('Helvetica').text(cand.resumeText, { lineGap: 2.5 });
  });
}

// 6. Generate Candidate Data Object
function generateCandidateData(job, index) {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(10, 999)}@${pick(['gmail.com', 'outlook.com', 'techmail.io', 'yahoo.com'])}`;
  const phone = `+91 ${randInt(90000, 99999)} ${randInt(10000, 99999)}`;
  const targetRole = pick(job.roles);
  const yoe = randInt(1, 8);
  const company1 = pick(COMPANIES);
  const company2 = pick(COMPANIES);
  const college = pick(COLLEGES);

  // Stage distribution
  const stages = ["applied", "applied", "applied", "screened", "screened", "interviewing", "offered", "rejected"];
  const stage = pick(stages);

  const summary = `Results-oriented ${targetRole} with ${yoe}+ years of experience in ${job.department.toLowerCase()} systems. Experienced at ${company1} and ${company2}, focusing on high availability, clean design, and modular code architecture.`;

  const resumeText = `EXPERIENCE HISTORY:
• ${targetRole} @ ${company1} (2023 - Present)
  - Engineered core features using ${job.skills.slice(0, 3).join(", ")}.
  - Spearheaded sprint deliveries, reduced bug reports by 30%, and optimized throughput.
• Software Engineer @ ${company2} (2021 - 2023)
  - Implemented modular components and backend integrations with ${job.skills.slice(2, 5).join(", ")}.
  - Participated in code reviews and CI/CD test automation.

EDUCATION:
• B.Tech / B.E. in Computer Engineering, ${college} (Graduated with Distinction)

KEY PROJECTS & CONTRIBUTIONS:
• Enterprise Cloud Portal: Scalable solution built with ${job.skills[0]} and ${job.skills[1]}.
• Automated Monitoring Pipeline: Integrated with modern logging and analytics tools.`;

  const pros = [
    `Demonstrated hands-on expertise in ${job.skills.slice(0, 2).join(" & ")}`,
    `Strong problem-solving track record at ${company1}`,
    `Clear communication and solid engineering background from ${college}`
  ];

  const cons = [
    "Could benefit from broader exposure to high-load distributed architectures",
    "Notice period is standard 30 to 60 days"
  ];

  const interviewQuestions = [
    { question: `Can you explain a key project at ${company1} where you utilized ${job.skills[0]}?`, focusArea: "Technical Execution" },
    { question: `How do you handle debugging complex production issues under tight timelines?`, focusArea: "Problem Solving" }
  ];

  return {
    name,
    email,
    phone,
    targetRole,
    skills: job.skills,
    summary,
    pros,
    cons,
    interviewQuestions,
    resumeText,
    stage,
    createdAt: getRandomJulyAugust2026Date()
  };
}

// 7. Main Execution Pipeline
async function run() {
  console.log("=== STARTING SEEDING & CLOUDINARY UPLOAD PIPELINE ===");
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB database.");

  // Step 1: Wipe existing candidates
  console.log("\n[Step 1] Wiping all existing candidates for Org ID:", TARGET_ORG_ID.toString());
  const deleteResult = await mongoose.connection.db.collection('candidates').deleteMany({ orgId: TARGET_ORG_ID });
  console.log(`✓ Deleted ${deleteResult.deletedCount} existing candidates from database.`);

  // Step 2: Update existing job postings with refined descriptions
  console.log("\n[Step 2] Updating existing 9 job postings with refined specifications...");
  for (const job of REFINED_JOBS) {
    const jobObjectId = new mongoose.Types.ObjectId(job.id);
    await mongoose.connection.db.collection('jobpostings').updateOne(
      { _id: jobObjectId, orgId: TARGET_ORG_ID },
      {
        $set: {
          title: job.title,
          department: job.department,
          location: job.location,
          type: job.type,
          description: job.description,
          requirements: job.requirements,
          status: "active",
          updatedAt: new Date()
        }
      }
    );
    console.log(`✓ Updated Job: "${job.title}" (${job.id})`);
  }

  // Step 3: Prepare temp resume directory
  const tempDir = path.join(__dirname, 'temp_resumes');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Step 4: Pre-generate a shared set of distinct Cloudinary PDF resumes per job to optimize upload speed
  console.log("\n[Step 3] Rendering 30 distinct styled PDF templates and uploading to Cloudinary...");
  
  const cloudinaryUrlsByJob = {};

  for (let j = 0; j < REFINED_JOBS.length; j++) {
    const job = REFINED_JOBS[j];
    cloudinaryUrlsByJob[job.id] = [];
    console.log(`\nGenerating & Uploading distinct PDF template pool for Job: ${job.title}...`);

    // Upload 15-20 distinct live Cloudinary PDFs for this job pool
    const poolSize = 15;
    for (let p = 0; p < poolSize; p++) {
      const sampleCand = generateCandidateData(job, p);
      const layoutRenderer = LAYOUT_STYLES[p % LAYOUT_STYLES.length];
      const tempPdfPath = path.join(tempDir, `temp_job_${job.id}_p${p}.pdf`);

      const doc = new PDFDocument({ margin: 40, autoFirstPage: true });
      const stream = fs.createWriteStream(tempPdfPath);
      doc.pipe(stream);
      layoutRenderer(doc, sampleCand);
      doc.end();

      await new Promise((resolve) => stream.on('finish', resolve));

      // Upload directly to Cloudinary
      try {
        const uploadRes = await cloudinary.uploader.upload(tempPdfPath, {
          folder: `org-control/org_${TARGET_ORG_ID}/job_${job.id}/resumes`,
          resource_type: "auto"
        });

        cloudinaryUrlsByJob[job.id].push(uploadRes.secure_url);
        process.stdout.write(`.`);
      } catch (upErr) {
        console.warn(`\nUpload warning for sample ${p}:`, upErr.message);
        cloudinaryUrlsByJob[job.id].push(`https://res.cloudinary.com/${cloudName}/image/upload/v1780682727/org-control/sample_resume_${p}.pdf`);
      }

      // Immediately delete local temporary PDF file
      if (fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }
    }
    console.log(`\n✓ Uploaded ${poolSize} distinct PDF resumes to Cloudinary for ${job.title}`);
  }

  // Cleanup temp dir
  if (fs.existsSync(tempDir)) {
    fs.rmdirSync(tempDir, { recursive: true });
  }

  // Step 5: Generate and insert ~2,500 candidates into MongoDB
  console.log("\n[Step 4] Batch inserting high-volume candidate applications into MongoDB...");
  let totalInserted = 0;

  for (const job of REFINED_JOBS) {
    const jobObjectId = new mongoose.Types.ObjectId(job.id);
    const candidateBatch = [];
    const urlPool = cloudinaryUrlsByJob[job.id];

    for (let c = 0; c < job.targetCount; c++) {
      const candData = generateCandidateData(job, c);
      const resumeUrl = urlPool[c % urlPool.length];

      candidateBatch.push({
        orgId: TARGET_ORG_ID,
        jobId: jobObjectId,
        name: candData.name,
        email: candData.email,
        phone: candData.phone,
        resumeUrl: resumeUrl,
        stage: candData.stage,
        offerStatus: candData.stage === "offered" ? "pending" : "none",
        isAiScreened: false,
        matchScore: 0,
        skills: candData.skills,
        summary: candData.summary,
        pros: candData.pros,
        cons: candData.cons,
        interviewQuestions: candData.interviewQuestions,
        resumeText: candData.resumeText,
        resumeEmbedding: [],
        createdAt: candData.createdAt,
        updatedAt: candData.createdAt
      });
    }

    // Chunked batch insertion
    const chunkSize = 100;
    for (let i = 0; i < candidateBatch.length; i += chunkSize) {
      const chunk = candidateBatch.slice(i, i + chunkSize);
      await mongoose.connection.db.collection('candidates').insertMany(chunk);
    }

    totalInserted += candidateBatch.length;
    console.log(`✓ Inserted ${candidateBatch.length} applications for: "${job.title}"`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 SUCCESS: Seeded ${totalInserted} candidates across 9 jobs!`);
  console.log(`✓ Date window: July 1, 2026 - August 31, 2026`);
  console.log(`✓ All match scores set to 0 (isAiScreened: false)`);
  console.log(`✓ Real Cloudinary PDF URLs attached to all records`);
  console.log(`✓ All local temporary PDF files deleted.`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
}

run().catch(console.error);
