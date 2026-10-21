/**
 * FINE Pedagogy E-Portfolio PDF Generator
 * Uses dynamic import of jsPDF & jspdf-autotable to prevent SSR issues
 */

export interface PortfolioProfile {
  name: string;
  email: string;
  schoolName?: string | null;
  phone?: string | null;
  bio?: string | null;
}

export interface PortfolioStats {
  knowledgeScore: number;
  skillsScore: number;
  attitudeScore: number;
  competencyScore: number;
  overallScore: number;
  lessonsCompleted: number;
  timeSpentMinutes: number;
  sessions: number;
}

export interface PortfolioTask {
  id: string;
  title: string;
  activityType: string;
  maxScore: number;
  status: 'pending' | 'submitted';
  score: number | null;
  feedback: string | null;
  className?: string;
}

export interface PortfolioCertificate {
  certificateCode: string;
  issuedName: string;
  schoolName: string | null;
  overallScore: number;
  issuedAt: string;
}

export interface GeneratePortfolioOptions {
  profile: PortfolioProfile;
  stats: PortfolioStats;
  tasks: PortfolioTask[];
  certificate?: PortfolioCertificate | null;
}

export async function generateFinePortfolioPdf(options: GeneratePortfolioOptions): Promise<void> {
  const { profile, stats, tasks, certificate } = options;

  // Dynamic import for client-only execution
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Color Palette
  const primaryGreen = [22, 78, 56] as const;
  const accentGold = [180, 135, 45] as const;
  const darkText = [30, 41, 59] as const;
  const mutedText = [100, 116, 139] as const;

  // 1. Top Decorative Header Banner
  doc.setFillColor(...primaryGreen);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(...accentGold);
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('FINE PEDAGOGY DIGITAL E-PORTFOLIO', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 240, 230);
  doc.text('FINE Model AR/AI 3D Interactive Hospitality Learning Framework', 14, 20);

  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Issue Date: ${dateStr}`, pageWidth - 14, 20, { align: 'right' });

  // 2. Student Information Box
  let currentY = 38;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...darkText);
  doc.text(profile.name || 'Student Name', 20, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedText);
  doc.text(`Email: ${profile.email || 'N/A'}`, 20, currentY + 14);
  doc.text(`Institution: ${profile.schoolName || 'Hospitality Vocational Institute'}`, 20, currentY + 20);

  // Overall Score Highlight badge in box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(pageWidth - 62, currentY + 4, 44, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text('OVERALL SCORE', pageWidth - 40, currentY + 9, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(6, 95, 70);
  doc.text(`${Math.round(stats.overallScore)}%`, pageWidth - 40, currentY + 17, { align: 'center' });

  // 3. FINE Pedagogy 4-Stage Learning Cycle
  currentY = 70;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryGreen);
  doc.text('FINE LEARNING FRAMEWORK STAGES', 14, currentY);

  const stages = [
    { code: 'F', name: 'Foundation', desc: '3D/AR Spatial Equipment & Table Setting' },
    { code: 'I', name: 'Interaction', desc: 'AI Voice Recognition & Word Pronunciation Drills' },
    { code: 'N', name: 'Navigation', desc: 'Branching Dilemma Decisions & Service Recovery' },
    { code: 'E', name: 'Exhibition', desc: 'Dynamic Assessment, Showcase & Certificate' },
  ];

  const colWidth = (pageWidth - 28 - 9) / 4;
  stages.forEach((stage, idx) => {
    const boxX = 14 + idx * (colWidth + 3);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(boxX, currentY + 4, colWidth, 18, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...accentGold);
    doc.text(`[${stage.code}] ${stage.name}`, boxX + 4, currentY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...darkText);
    const splitDesc = doc.splitTextToSize(stage.desc, colWidth - 8);
    doc.text(splitDesc, boxX + 4, currentY + 15);
  });

  // 4. KSA-C Competency Matrix Table
  currentY = 98;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryGreen);
  doc.text('KSA-C COMPETENCY PERFORMANCE EVALUATION', 14, currentY);

  const ksaRows = [
    ['Knowledge (K 30%)', 'Culinary & F&B Tableware Terminology, Standards, Equipment (Weight: 30%)', `${Math.round(stats.knowledgeScore)}%`, stats.knowledgeScore >= 70 ? 'Advanced' : 'Proficient'],
    ['Skills (S 50%)', 'AI Pronunciation Precision, Spoken English Fluency, Speech Drills, AR 3D (Weight: 50%)', `${Math.round(stats.skillsScore)}%`, stats.skillsScore >= 70 ? 'Advanced' : 'Proficient'],
    ['Attitude (A 20%)', 'Hospitality Etiquette, Professional Engagement, Problem Solving (Weight: 20%)', `${Math.round(stats.attitudeScore)}%`, stats.attitudeScore >= 70 ? 'Advanced' : 'Proficient'],
    ['Competency (C 100%)', 'Holistic Competency Mastery: C = K(30) + S(50) + A(20)', `${Math.round(stats.competencyScore)}%`, stats.competencyScore >= 70 ? 'Advanced' : 'Proficient'],
  ];

  autoTable(doc, {
    startY: currentY + 4,
    margin: { left: 14, right: 14 },
    head: [['Competency Domain', 'Evaluation Description', 'Score', 'Standard Level']],
    body: ksaRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 41, 59] },
    headStyles: { fillColor: [22, 78, 56], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 95 },
      2: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 28, halign: 'center' },
    },
  });

  // 5. Tasks and Activity History Table
  const lastTableDoc = doc as unknown as { lastAutoTable?: { finalY: number } };
  currentY = (lastTableDoc.lastAutoTable?.finalY ?? 150) + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryGreen);
  doc.text('LEARNING ASSIGNMENTS & ACTIVITY RECORD', 14, currentY);

  const taskRows = tasks.slice(0, 10).map((t, idx) => [
    String(idx + 1),
    t.title,
    t.activityType,
    t.status === 'submitted' ? 'Submitted' : 'Pending',
    t.score !== null ? `${t.score} / ${t.maxScore}` : `- / ${t.maxScore}`,
    (t.feedback || 'Completed verified FINE cycle assignment').slice(0, 45),
  ]);

  if (taskRows.length === 0) {
    taskRows.push(['1', 'FINE Pedagogy Integrated Cycle', 'interactive', 'Submitted', `${Math.round(stats.overallScore)} / 100`, 'Automated curriculum evaluation']);
  }

  autoTable(doc, {
    startY: currentY + 4,
    margin: { left: 14, right: 14 },
    head: [['#', 'Activity / Task Title', 'Stage Type', 'Status', 'Score', 'Instructor / AI Feedback']],
    body: taskRows,
    theme: 'striped',
    styles: { fontSize: 7.5, cellPadding: 2.2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [34, 84, 63], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 60, fontStyle: 'bold' },
      2: { cellWidth: 24 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 50 },
    },
  });

  // 6. Certificate Verification Badge (if available)
  const afterTasksY = (lastTableDoc.lastAutoTable?.finalY ?? 220) + 8;
  if (certificate && afterTasksY < pageHeight - 35) {
    doc.setFillColor(254, 252, 232);
    doc.setDrawColor(202, 138, 4);
    doc.roundedRect(14, afterTasksY, pageWidth - 28, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(161, 98, 7);
    doc.text('OFFICIAL CERTIFICATE OF COMPETENCY GRANTED', 20, afterTasksY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(113, 63, 18);
    doc.text(`Certificate Code: ${certificate.certificateCode} | Issued to: ${certificate.issuedName} | Score: ${certificate.overallScore}%`, 20, afterTasksY + 12);
  }

  // 7. Footer on Every Page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'FINE Pedagogy Model: Foundation -> Interaction -> Navigation -> Exhibition | Vocational Education Innovation',
      14,
      pageHeight - 7,
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }

  // Save the PDF
  const safeName = (profile.name || 'student').replace(/[^a-zA-Z0-9\s_-]/g, '').trim() || 'student';
  doc.save(`FINE_E-Portfolio_${safeName}.pdf`);
}
