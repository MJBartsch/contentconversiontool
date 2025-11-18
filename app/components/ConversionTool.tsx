'use client';

import { useState, useRef } from 'react';
import mammoth from 'mammoth';
import { saveAs } from 'file-saver';

// Template options
const TEMPLATES = {
  multiCasino: {
    name: 'Multi-Casino Comparison',
    description: 'Best for comparison articles, listicles, and multiple brand reviews',
    icon: '📊',
  },
  singleCasino: {
    name: 'Single Casino Review',
    description: 'Best for in-depth single brand/product reviews',
    icon: '🎰',
  },
};

// Helper to parse HTML string into a DOM structure
const parseHTML = (htmlString: string) => {
  if (typeof window === 'undefined') return null;
  const parser = new DOMParser();
  return parser.parseFromString(htmlString, 'text/html');
};

// Extract structured content from Word HTML
const extractStructuredContent = (htmlString: string) => {
  const doc = parseHTML(htmlString);
  if (!doc) return { headings: [], paragraphs: [], lists: [], tables: [] };

  const headings: { level: number; text: string }[] = [];
  const paragraphs: string[] = [];
  const lists: { type: 'ul' | 'ol'; items: string[] }[] = [];
  const tables: string[][] = [];

  // Extract headings (h1-h6)
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const level = parseInt(heading.tagName.substring(1));
    headings.push({ level, text: heading.textContent?.trim() || '' });
  });

  // Extract paragraphs
  doc.querySelectorAll('p').forEach((p) => {
    const text = p.textContent?.trim();
    if (text && text.length > 0) {
      paragraphs.push(text);
    }
  });

  // Extract lists
  doc.querySelectorAll('ul, ol').forEach((list) => {
    const items: string[] = [];
    list.querySelectorAll('li').forEach((li) => {
      const text = li.textContent?.trim();
      if (text) items.push(text);
    });
    if (items.length > 0) {
      lists.push({
        type: list.tagName.toLowerCase() as 'ul' | 'ol',
        items,
      });
    }
  });

  // Extract tables
  doc.querySelectorAll('table').forEach((table) => {
    const rows: string[][] = [];
    table.querySelectorAll('tr').forEach((tr) => {
      const cells: string[] = [];
      tr.querySelectorAll('td, th').forEach((cell) => {
        cells.push(cell.textContent?.trim() || '');
      });
      if (cells.length > 0) rows.push(cells);
    });
    if (rows.length > 0) tables.push(...rows);
  });

  return { headings, paragraphs, lists, tables };
};

// Detect section type based on content
const detectSectionType = (heading: string): string => {
  const lower = heading.toLowerCase();
  if (lower.includes('faq') || lower.includes('question')) return 'faq';
  if (lower.includes('pro') && lower.includes('con')) return 'proscons';
  if (lower.includes('pros') || lower.includes('advantages')) return 'pros';
  if (lower.includes('cons') || lower.includes('disadvantages')) return 'cons';
  if (lower.includes('feature')) return 'features';
  if (lower.includes('comparison') || lower.includes('compare')) return 'comparison';
  if (lower.includes('bonus')) return 'bonus';
  if (lower.includes('game')) return 'games';
  if (lower.includes('payment') || lower.includes('banking')) return 'payment';
  if (lower.includes('support')) return 'support';
  if (lower.includes('security') || lower.includes('license')) return 'security';
  return 'general';
};

export default function ConversionTool() {
  const [selectedTemplate, setSelectedTemplate] = useState<'multiCasino' | 'singleCasino' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedHTML, setExtractedHTML] = useState<string>('');
  const [convertedHTML, setConvertedHTML] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      // Read the .docx file
      const arrayBuffer = await file.arrayBuffer();

      // Extract HTML using mammoth (preserves structure)
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setExtractedHTML(result.value);

      // Auto-convert if template is selected
      if (selectedTemplate) {
        convertToHTML(result.value, selectedTemplate);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please ensure it\'s a valid .docx file.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert HTML to template-based HTML
  const convertToHTML = (htmlString: string, template: 'multiCasino' | 'singleCasino') => {
    setIsProcessing(true);

    try {
      let html = '';

      if (template === 'multiCasino') {
        html = generateMultiCasinoHTML(htmlString);
      } else {
        html = generateSingleCasinoHTML(htmlString);
      }

      setConvertedHTML(html);
      setShowPreview(true);
    } catch (error) {
      console.error('Error converting to HTML:', error);
      alert('Error converting to HTML. Please check your content.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Multi-Casino HTML with intelligent mapping
  const generateMultiCasinoHTML = (htmlString: string): string => {
    const content = extractStructuredContent(htmlString);

    // Extract title (first heading)
    const title = content.headings[0]?.text || 'Your Article Title';

    // First 2 paragraphs as intro
    const introParagraphs = content.paragraphs.slice(0, 2);

    // Build sections based on detected headings
    let sections = '';
    let currentSection = '';
    let sectionType = 'general';

    for (let i = 1; i < content.headings.length; i++) {
      const heading = content.headings[i];
      sectionType = detectSectionType(heading.text);

      const headingTag = heading.level === 2 ? 'h2' : heading.level === 3 ? 'h3' : 'h4';
      currentSection += `<${headingTag}>${heading.text}</${headingTag}>\n`;
    }

    // Add remaining paragraphs
    const bodyParagraphs = content.paragraphs.slice(2);
    bodyParagraphs.forEach(p => {
      currentSection += `<p>${p}</p>\n`;
    });

    // Add lists
    content.lists.forEach(list => {
      const listTag = list.type === 'ul' ? 'ul' : 'ol';
      currentSection += `<${listTag}>\n`;
      list.items.forEach(item => {
        currentSection += `  <li>${item}</li>\n`;
      });
      currentSection += `</${listTag}>\n`;
    });

    // Add tables if any
    if (content.tables.length > 0) {
      currentSection += `<div class="table-container">\n<div class="table-responsive">\n<table class="platform-table">\n`;
      currentSection += `<tbody>\n`;
      content.tables.forEach(row => {
        currentSection += `<tr>\n`;
        row.forEach((cell, idx) => {
          if (idx === 0) {
            currentSection += `  <th scope="row">${cell}</th>\n`;
          } else {
            currentSection += `  <td>${cell}</td>\n`;
          }
        });
        currentSection += `</tr>\n`;
      });
      currentSection += `</tbody>\n</table>\n</div>\n</div>\n`;
    }

    sections = currentSection;

    return `<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styling-test-page-fixed.css">
</head>
<body>

<div class="crypto-betting-widget" id="main-content">
<article>
    <header class="article-header">
        <h1>${title}</h1>
        ${introParagraphs.map(p => `<p class="intro">${p}</p>`).join('\n        ')}
    </header>

    <div>
        [elementor-template id="1128"]
    </div>

    <!-- Quick Verdict Section -->
    <section class="quick-verdict" aria-labelledby="quick-verdict-heading">
        <div class="qv-header">
            <h2 id="quick-verdict-heading" class="qv-title">Quick Verdict</h2>
            <p class="qv-subtitle">Edit this subtitle with your verdict summary.</p>
            <div class="qv-updated">Last updated: <time datetime="${new Date().toISOString().slice(0, 7)}">November 2025</time></div>
        </div>

        <div class="qv-trust-signals">
            <div class="qv-trust-item">
                <span class="qv-trust-icon" aria-hidden="true">✓</span>
                Trust Signal 1
            </div>
            <div class="qv-trust-item">
                <span class="qv-trust-icon" aria-hidden="true">✓</span>
                Trust Signal 2
            </div>
            <div class="qv-trust-item">
                <span class="qv-trust-icon" aria-hidden="true">✓</span>
                Trust Signal 3
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <section class="content-section">
        ${sections}
    </section>

</article>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            const tabsContainer = this.closest('.tabs-container');

            tabsContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            tabsContainer.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(targetTab)?.classList.add('active');
        });
    });
});
</script>

</body>
</html>`;
  };

  // Generate Single Casino HTML with intelligent mapping
  const generateSingleCasinoHTML = (htmlString: string): string => {
    const content = extractStructuredContent(htmlString);

    // Extract title and intro
    const title = content.headings[0]?.text || 'Casino Review 2025';
    const introParagraphs = content.paragraphs.slice(0, 2);

    // Organize content by detected sections
    const sections: { [key: string]: string } = {
      overview: '',
      bonuses: '',
      games: '',
      proscons: '',
      general: ''
    };

    let currentSectionType = 'overview';
    let sectionContent = '';

    // Process headings and map to sections
    for (let i = 1; i < content.headings.length; i++) {
      const heading = content.headings[i];
      const type = detectSectionType(heading.text);

      // Save previous section
      if (currentSectionType && sectionContent) {
        sections[currentSectionType] += sectionContent;
      }

      currentSectionType = type;
      const headingTag = heading.level === 2 ? 'h3' : 'h4';
      sectionContent = `<${headingTag}>${heading.text}</${headingTag}>\n`;
    }

    // Add paragraphs to general section
    const bodyParagraphs = content.paragraphs.slice(2);
    bodyParagraphs.forEach(p => {
      sections.general += `<p>${p}</p>\n`;
    });

    // Add lists to appropriate sections
    content.lists.forEach(list => {
      const listTag = list.type === 'ul' ? 'ul' : 'ol';
      let listHTML = `<${listTag}>\n`;
      list.items.forEach(item => {
        listHTML += `  <li>${item}</li>\n`;
      });
      listHTML += `</${listTag}>\n`;

      // Try to assign to most relevant section
      if (sections.games === '') {
        sections.games += listHTML;
      } else if (sections.bonuses === '') {
        sections.bonuses += listHTML;
      } else {
        sections.general += listHTML;
      }
    });

    // Build pros/cons if detected
    let prosConsHTML = '';
    if (sections.proscons) {
      prosConsHTML = `
        <div class="proscons-grid">
            <div class="pros-section">
                <h4><span aria-hidden="true">✓</span> Pros</h4>
                <ul class="pros-list">
                    <li>Edit pros here</li>
                </ul>
            </div>
            <div class="cons-section">
                <h4><span aria-hidden="true">✗</span> Cons</h4>
                <ul class="cons-list">
                    <li>Edit cons here</li>
                </ul>
            </div>
        </div>`;
    }

    return `<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styling-test-page-fixed.css">
</head>
<body>

<div class="crypto-betting-widget" id="main-content">
<article>

<header class="article-header">
    <h1>${title}</h1>
    ${introParagraphs.map(p => `<p class="intro">${p}</p>`).join('\n    ')}
</header>

<div>
    [elementor-template id="1128"]
</div>

<!-- Quick Verdict Section -->
<section class="quick-verdict">
    <div class="qv-header">
        <h2 class="qv-title">Quick Verdict</h2>
        <p class="qv-subtitle">After extensive testing...</p>
        <div class="qv-updated">Last updated: <time datetime="${new Date().toISOString().slice(0, 7)}">November 2025</time></div>
    </div>

    <div class="qv-trust-signals">
        <div class="qv-trust-item">
            <span class="qv-trust-icon" aria-hidden="true">✓</span>
            Feature 1
        </div>
        <div class="qv-trust-item">
            <span class="qv-trust-icon" aria-hidden="true">✓</span>
            Feature 2
        </div>
    </div>
</section>

<!-- Platform Card with Tabs -->
<div class="platform-card">
    <div class="tabs-container">
        <div class="tab-nav" role="tablist">
            <button class="tab-button active" role="tab" data-tab="overview" aria-selected="true">Overview</button>
            <button class="tab-button" role="tab" data-tab="bonuses">Bonuses</button>
            <button class="tab-button" role="tab" data-tab="games">Games</button>
            <button class="tab-button" role="tab" data-tab="proscons">Pros & Cons</button>
        </div>

        <div class="tab-content">
            <div class="tab-pane active" id="overview">
                ${sections.overview || sections.general}
            </div>

            <div class="tab-pane" id="bonuses">
                ${sections.bonuses || '<p>Edit bonus information here</p>'}
            </div>

            <div class="tab-pane" id="games">
                ${sections.games || '<p>Edit games information here</p>'}
            </div>

            <div class="tab-pane" id="proscons">
                ${prosConsHTML || '<p>Edit pros and cons here</p>'}
            </div>
        </div>
    </div>

    <div class="risk-warning">
        <p><strong>18+ Only:</strong> Please gamble responsibly. Visit BeGambleAware.org for support.</p>
    </div>
</div>

<!-- Additional Content -->
<section class="content-section">
    ${sections.general}
</section>

</article>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            const tabsContainer = this.closest('.tabs-container');

            tabsContainer.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            tabsContainer.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });

            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            document.getElementById(targetTab)?.classList.add('active');
        });
    });
});
</script>

</body>
</html>`;
  };

  // Download HTML file
  const handleDownload = () => {
    if (!convertedHTML) return;

    const blob = new Blob([convertedHTML], { type: 'text/html;charset=utf-8' });
    const filename = uploadedFile
      ? uploadedFile.name.replace('.docx', '.html')
      : 'converted-content.html';
    saveAs(blob, filename);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!convertedHTML) return;

    try {
      await navigator.clipboard.writeText(convertedHTML);
      alert('HTML copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12 pt-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Word to HTML Converter
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your .docx file, select a template, and convert to styled HTML with intelligent content mapping
        </p>
      </div>

      {/* Template Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Step 1: Choose Your Template
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key as 'multiCasino' | 'singleCasino')}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedTemplate === key
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600">
                {template.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Step 2: Upload Your .docx File
        </h2>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="text-6xl mb-4">📄</div>
          {uploadedFile ? (
            <>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-gray-600">
                Click to upload a different file
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-600">
                .docx files only
              </p>
            </>
          )}
        </div>
      </div>

      {/* Convert Button */}
      {selectedTemplate && extractedHTML && (
        <div className="mb-8 text-center">
          <button
            onClick={() => convertToHTML(extractedHTML, selectedTemplate)}
            disabled={isProcessing}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Converting...' : 'Convert to HTML'}
          </button>
        </div>
      )}

      {/* Preview & Download Section */}
      {convertedHTML && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Step 3: Preview & Download
            </h2>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2"
              >
                📋 Copy HTML
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
              >
                ⬇️ Download HTML
              </button>
            </div>
          </div>

          {/* Split View Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            >
              {showPreview ? '👁️ Hide Preview' : '👁️ Show Preview'}
            </button>
          </div>

          {/* Split View */}
          <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {/* HTML Code View */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="bg-gray-800 px-4 py-2 text-white font-semibold">
                HTML Code
              </div>
              <pre className="p-4 text-sm text-green-400 overflow-auto max-h-96">
                <code>{convertedHTML}</code>
              </pre>
            </div>

            {/* Live Preview */}
            {showPreview && (
              <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200">
                <div className="bg-gray-100 px-4 py-2 text-gray-800 font-semibold border-b">
                  Live Preview
                </div>
                <div className="p-4 overflow-auto max-h-96">
                  <iframe
                    srcDoc={convertedHTML}
                    className="w-full min-h-[500px] border-0"
                    title="Preview"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 Smart Conversion Features
        </h3>
        <ul className="list-disc list-inside space-y-2 text-blue-800">
          <li><strong>Preserves structure:</strong> Headings, lists, tables from your Word doc</li>
          <li><strong>Intelligent mapping:</strong> Automatically detects FAQs, pros/cons, features</li>
          <li><strong>Semantic HTML:</strong> Proper heading hierarchy (H2, H3, H4)</li>
          <li><strong>Section detection:</strong> Identifies bonus, games, payment sections by keywords</li>
          <li><strong>Template integration:</strong> Maps content to appropriate template sections</li>
        </ul>
      </div>
    </div>
  );
}
