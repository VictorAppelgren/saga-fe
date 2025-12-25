import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type PdfSection = {
  title: string;
  content: string;
  isCustom?: boolean;
};

// Sanitize text to remove characters that WinAnsi can't encode
function sanitizeText(text: string): string {
  return text
    // Replace non-breaking hyphen with regular hyphen
    .replace(/\u2011/g, '-')
    // Replace en-dash with regular hyphen
    .replace(/\u2013/g, '-')
    // Replace em-dash with regular hyphen
    .replace(/\u2014/g, '-')
    // Replace curly quotes with straight quotes
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    // Replace ellipsis with three dots
    .replace(/\u2026/g, '...')
    // Replace bullet with asterisk
    .replace(/\u2022/g, '*')
    // Remove any other non-ASCII characters that might cause issues
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Try to keep common characters, replace others with space
      const code = char.charCodeAt(0);
      if (code > 255) return ' ';
      return char;
    });
}

export async function generateStrategyPdf(
  strategyTitle: string,
  sections: PdfSection[],
  logo?: Uint8Array
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  
  // Sanitize all input text
  strategyTitle = sanitizeText(strategyTitle);
  sections = sections.map(s => ({
    ...s,
    title: sanitizeText(s.title),
    content: sanitizeText(s.content)
  }));
  
  // Embed premium fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  
  // Design constants - Apple × JP Morgan fusion
  const COLORS = {
    navy: rgb(0.173, 0.243, 0.314),      // #2c3e50 - JP Morgan navy
    appleBlue: rgb(0, 0.443, 0.890),     // #0071e3 - Apple blue
    charcoal: rgb(0.2, 0.2, 0.2),        // #333333 - body text
    lightGray: rgb(0.6, 0.6, 0.6),       // #999999 - muted text
    divider: rgb(0.878, 0.878, 0.878),   // #e0e0e0 - subtle lines
    customBg: rgb(1, 0.976, 0.898),      // #fff9e6 - warm highlight
    accentBg: rgb(0.941, 0.969, 1),      // #f0f7ff - cool highlight
  };
  
  const MARGINS = { top: 72, bottom: 60, left: 60, right: 60 };
  
  // Helper: Word wrap text to fit width
  function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }
  
  // Create first page
  let page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const contentWidth = width - MARGINS.left - MARGINS.right;
  let currentY = height - MARGINS.top;
  
  // ========== COVER PAGE HEADER ==========
  // Subtle top accent line (Apple style)
  page.drawRectangle({
    x: 0,
    y: height - 3,
    width: width,
    height: 3,
    color: COLORS.appleBlue,
  });
  
  // Strategy title - large, bold, navy
  currentY -= 60;
  page.drawText(strategyTitle, {
    x: MARGINS.left,
    y: currentY,
    size: 28,
    font: helveticaBold,
    color: COLORS.navy,
  });
  
  // Subtitle - "Investment Strategy Analysis"
  currentY -= 25;
  page.drawText('Investment Strategy Analysis', {
    x: MARGINS.left,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLORS.lightGray,
  });
  
  // Date - right aligned, elegant
  const dateStr = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const dateWidth = helvetica.widthOfTextAtSize(dateStr, 10);
  page.drawText(dateStr, {
    x: width - MARGINS.right - dateWidth,
    y: currentY,
    size: 10,
    font: helvetica,
    color: COLORS.lightGray,
  });
  
  // Elegant divider line
  currentY -= 20;
  page.drawLine({
    start: { x: MARGINS.left, y: currentY },
    end: { x: width - MARGINS.right, y: currentY },
    thickness: 0.5,
    color: COLORS.divider,
  });
  
  currentY -= 40;
  
  // ========== CONTENT SECTIONS ==========
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    
    // Check if we need a new page
    if (currentY < MARGINS.bottom + 150) {
      page = pdfDoc.addPage([595, 842]);
      currentY = height - MARGINS.top - 20;
    }
    
    // Section number badge (Apple style)
    const sectionNum = `${i + 1}`;
    const badgeSize = 24;
    page.drawCircle({
      x: MARGINS.left + 12,
      y: currentY - 8,
      size: 12,
      color: section.isCustom ? COLORS.customBg : COLORS.accentBg,
      borderColor: section.isCustom ? rgb(0.941, 0.784, 0.314) : COLORS.appleBlue,
      borderWidth: 1,
    });
    page.drawText(sectionNum, {
      x: MARGINS.left + (sectionNum.length === 1 ? 8.5 : 6),
      y: currentY - 12,
      size: 10,
      font: helveticaBold,
      color: COLORS.navy,
    });
    
    // Section title - bold, navy, prominent
    page.drawText(section.title, {
      x: MARGINS.left + 32,
      y: currentY - 12,
      size: 16,
      font: helveticaBold,
      color: COLORS.navy,
    });
    
    currentY -= 35;
    
    // Content box with subtle background (for custom sections)
    if (section.isCustom) {
      const contentLines = section.content.split('\n').flatMap(line => 
        wrapText(line || ' ', timesItalic, 10.5, contentWidth - 40)
      );
      const boxHeight = contentLines.length * 16 + 20;
      
      // Rounded rectangle background
      page.drawRectangle({
        x: MARGINS.left + 10,
        y: currentY - boxHeight + 10,
        width: contentWidth - 20,
        height: boxHeight,
        color: COLORS.customBg,
        borderColor: rgb(0.941, 0.784, 0.314),
        borderWidth: 0.5,
      });
      
      // "Custom Note" label
      page.drawText('CUSTOM NOTE', {
        x: MARGINS.left + 20,
        y: currentY - 12,
        size: 8,
        font: helveticaBold,
        color: rgb(0.706, 0.588, 0.235),
      });
      currentY -= 20;
      
      // Content in italic
      for (const line of contentLines) {
        page.drawText(line, {
          x: MARGINS.left + 20,
          y: currentY,
          size: 10.5,
          font: timesItalic,
          color: COLORS.charcoal,
        });
        currentY -= 16;
      }
      currentY -= 10;
    } else {
      // Regular content - clean, readable
      const contentLines = section.content.split('\n').flatMap(line => 
        wrapText(line || ' ', helvetica, 11, contentWidth - 20)
      );
      
      for (const line of contentLines) {
        if (currentY < MARGINS.bottom + 50) {
          page = pdfDoc.addPage([595, 842]);
          currentY = height - MARGINS.top - 20;
        }
        
        page.drawText(line, {
          x: MARGINS.left + 10,
          y: currentY,
          size: 11,
          font: helvetica,
          color: COLORS.charcoal,
        });
        currentY -= 17;
      }
    }
    
    // Section spacing
    currentY -= 30;
  }
  
  // ========== FOOTER ON ALL PAGES ==========
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    
    // Bottom accent line
    p.drawLine({
      start: { x: MARGINS.left, y: 45 },
      end: { x: width - MARGINS.right, y: 45 },
      thickness: 0.5,
      color: COLORS.divider,
    });
    
    // Page number - left
    p.drawText(`Page ${i + 1} of ${pages.length}`, {
      x: MARGINS.left,
      y: 30,
      size: 8,
      font: helvetica,
      color: COLORS.lightGray,
    });
    
    // Confidential - right
    const confText = 'CONFIDENTIAL';
    const confWidth = helveticaBold.widthOfTextAtSize(confText, 8);
    p.drawText(confText, {
      x: width - MARGINS.right - confWidth,
      y: 30,
      size: 8,
      font: helveticaBold,
      color: COLORS.lightGray,
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
