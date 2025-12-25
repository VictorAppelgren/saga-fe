// Apple + JPMorgan inspired PDF design system
export const PDF_STYLES = {
  // Typography
  fonts: {
    title: { size: 18, weight: 'bold', family: 'Helvetica' },
    header: { size: 14, weight: 'semibold', family: 'Helvetica' },
    body: { size: 11, weight: 'normal', family: 'Helvetica', lineHeight: 1.5 },
    customNote: { size: 11, weight: 'italic', family: 'Georgia' }
  },
  
  // Colors
  colors: {
    primary: '#2c3e50', // JPM navy
    accent: '#0071e3', // Apple blue
    divider: '#e0e0e0',
    customBg: '#fff9e6', // Custom note background
    calloutBg: '#f0f7ff' // Blue highlight
  },
  
  // Layout
  margins: { top: 72, bottom: 72, left: 54, right: 54 }, // 2.54cm = 72pt
  
  // Elements
  borders: {
    callout: { radius: 4, width: 0.5, color: '#0071e3' },
    customNote: { radius: 2, width: 0.25, color: '#e0e0e0' }
  }
};

export const buildHeader = (pdfDoc: PDFDocument, title: string) => {
  // Implement Apple-style header with logo + title
  // Placeholder - we'll implement this after package install
};

export const buildFooter = (pdfDoc: PDFDocument, pageNum: number) => {
  // JPMorgan-style footer with confidentiality
};
