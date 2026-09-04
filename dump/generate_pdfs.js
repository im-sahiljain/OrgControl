const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generateDistinctPDFResumes() {
  const candidates = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_candidates_seed.json'), 'utf8'));
  const resDir = path.join(__dirname, 'resumes');
  if (!fs.existsSync(resDir)) {
    fs.mkdirSync(resDir, { recursive: true });
  }

  const layouts = [
    // Layout 1: Executive Dark Header Accent
    (doc, cand) => {
      doc.rect(0, 0, doc.page.width, 100).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(cand.name, 50, 30);
      doc.fillColor('#38bdf8').fontSize(11).font('Helvetica').text(cand.jobRefId ? `Target Position: ${cand.jobRefId}` : 'Professional Candidate', 50, 58);
      doc.fillColor('#94a3b8').fontSize(9).text(`${cand.email}  |  ${cand.phone}  |  LinkedIn Verified`, 50, 74);

      doc.y = 120;
      doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY');
      doc.rect(50, doc.y + 2, 500, 1).fill('#cbd5e1');
      doc.moveDown(0.6);
      doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(cand.summary, { lineGap: 3 });

      doc.moveDown(1.2);
      doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('TECHNICAL SKILLS & COMPETENCIES');
      doc.rect(50, doc.y + 2, 500, 1).fill('#cbd5e1');
      doc.moveDown(0.6);
      doc.fillColor('#0369a1').fontSize(9.5).font('Helvetica-Bold').text(cand.skills.join('  •  '));

      doc.moveDown(1.2);
      doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('FULL RESUME DETAILS & EXPERIENCE');
      doc.rect(50, doc.y + 2, 500, 1).fill('#cbd5e1');
      doc.moveDown(0.6);
      doc.fillColor('#334155').fontSize(9).font('Helvetica').text(cand.resumeText, { lineGap: 3 });
    },

    // Layout 2: Modern Teal Side Stripe Template
    (doc, cand) => {
      doc.rect(0, 0, 170, doc.page.height).fill('#0d9488');
      
      // Sidebar Text
      doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text(cand.name, 20, 40, { width: 130 });
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica-Bold').text('CONTACT DETAILS', { width: 130 });
      doc.fontSize(8).font('Helvetica').text(`Email:\n${cand.email}\n\nPhone:\n${cand.phone}\n\nStatus:\nVerified Candidate`, { width: 130 });
      
      doc.moveDown(1.5);
      doc.fontSize(9).font('Helvetica-Bold').text('CORE SKILLS', { width: 130 });
      cand.skills.forEach(s => {
        doc.fontSize(8).font('Helvetica').text(`• ${s}`, { width: 130 });
      });

      // Main Content Area
      doc.fillColor('#111827').fontSize(18).font('Helvetica-Bold').text(cand.name, 195, 40);
      doc.fillColor('#0d9488').fontSize(11).font('Helvetica-Bold').text('Curriculum Vitae', 195, 65);
      doc.rect(195, 80, 360, 1.5).fill('#0d9488');

      doc.y = 95;
      doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text('CAREER OVERVIEW', 195);
      doc.moveDown(0.4);
      doc.fillColor('#374151').fontSize(9).font('Helvetica').text(cand.summary, 195, doc.y, { width: 360, lineGap: 3 });

      doc.moveDown(1);
      doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text('EXPERIENCE & CREDENTIALS', 195);
      doc.moveDown(0.4);
      doc.fillColor('#374151').fontSize(8.5).font('Helvetica').text(cand.resumeText, 195, doc.y, { width: 360, lineGap: 3 });
    },

    // Layout 3: Minimalist Corporate Elegant (Serif typography look)
    (doc, cand) => {
      doc.fillColor('#1e1b4b').fontSize(24).font('Times-Bold').text(cand.name, { align: 'center' });
      doc.fillColor('#4338ca').fontSize(10).font('Times-Italic').text(`${cand.email}   |   ${cand.phone}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.rect(80, doc.y, 435, 0.8).fill('#818cf8');

      doc.moveDown(1.2);
      doc.fillColor('#1e1b4b').fontSize(11).font('Times-Bold').text('PROFILE SUMMARY', 50);
      doc.fillColor('#1e293b').fontSize(9.5).font('Times-Roman').text(cand.summary, 50, doc.y + 4, { lineGap: 3 });

      doc.moveDown(1.2);
      doc.fillColor('#1e1b4b').fontSize(11).font('Times-Bold').text('KEY STRENGTHS & HIGHLIGHTS', 50);
      cand.pros.forEach(p => {
        doc.fillColor('#1e293b').fontSize(9).font('Times-Roman').text(`• ${p}`, { lineGap: 2 });
      });

      doc.moveDown(1.2);
      doc.fillColor('#1e1b4b').fontSize(11).font('Times-Bold').text('DETAILED EXPERIENCE & EDUCATION', 50);
      doc.fillColor('#1e293b').fontSize(9).font('Times-Roman').text(cand.resumeText, { lineGap: 3 });
    },

    // Layout 4: Contemporary Clean Grid Header
    (doc, cand) => {
      doc.rect(40, 40, 515, 65).fill('#f8fafc');
      doc.rect(40, 40, 515, 65).stroke('#e2e8f0');

      doc.fillColor('#0284c7').fontSize(18).font('Helvetica-Bold').text(cand.name, 55, 52);
      doc.fillColor('#475569').fontSize(9).font('Helvetica').text(`Email: ${cand.email}   •   Phone: ${cand.phone}`, 55, 75);

      doc.y = 120;
      doc.fillColor('#0284c7').fontSize(11).font('Helvetica-Bold').text('CANDIDATE SUMMARY');
      doc.moveDown(0.3);
      doc.fillColor('#334155').fontSize(9).font('Helvetica').text(cand.summary, { lineGap: 3 });

      doc.moveDown(1);
      doc.fillColor('#0284c7').fontSize(11).font('Helvetica-Bold').text('SPECIALIZED SKILLS & COMPETENCIES');
      doc.moveDown(0.3);
      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(cand.skills.join(', '));

      doc.moveDown(1);
      doc.fillColor('#0284c7').fontSize(11).font('Helvetica-Bold').text('FULL WORK EXPERIENCE');
      doc.moveDown(0.3);
      doc.fillColor('#334155').fontSize(8.5).font('Helvetica').text(cand.resumeText, { lineGap: 3 });
    }
  ];

  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];
    const doc = new PDFDocument({ margin: 50, autoFirstPage: true });
    const cleanName = cand.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `${cleanName}_resume.pdf`;
    const filePath = path.join(resDir, filename);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Pick distinct layout style based on candidate index
    const renderLayout = layouts[i % layouts.length];
    renderLayout(doc, cand);

    doc.end();

    await new Promise((resolve) => stream.on('finish', resolve));

    cand.localPdfPath = filePath;
    cand.resumeUrl = `file://${filePath}`;
    cand.layoutTemplate = `Template Layout ${ (i % layouts.length) + 1 }`;
    console.log(`Generated styled PDF resume for ${cand.name} (${cand.layoutTemplate}): ${filePath}`);
  }

  fs.writeFileSync(path.join(__dirname, 'new_candidates_seed.json'), JSON.stringify(candidates, null, 2));
  console.log('Successfully generated all distinct PDF resumes in ./dump/resumes');
}

generateDistinctPDFResumes().catch(console.error);
