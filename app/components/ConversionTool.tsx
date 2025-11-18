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

export default function ConversionTool() {
  const [selectedTemplate, setSelectedTemplate] = useState<'multiCasino' | 'singleCasino' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
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

      // Extract text using mammoth
      const result = await mammoth.extractRawText({ arrayBuffer });
      setExtractedText(result.value);

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

  // Convert text to HTML based on selected template
  const convertToHTML = (text: string, template: 'multiCasino' | 'singleCasino') => {
    setIsProcessing(true);

    try {
      let html = '';

      if (template === 'multiCasino') {
        html = generateMultiCasinoHTML(text);
      } else {
        html = generateSingleCasinoHTML(text);
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

  // Generate Multi-Casino HTML
  const generateMultiCasinoHTML = (text: string): string => {
    // Parse the text and wrap it in the multi-casino template structure
    const lines = text.split('\n').filter(line => line.trim());

    let bodyContent = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Simple heuristic: if line is all caps or short, it's likely a heading
      if (trimmed === trimmed.toUpperCase() && trimmed.length < 100) {
        bodyContent += `<h2>${trimmed}</h2>\n`;
      } else if (trimmed.length < 150 && !trimmed.endsWith('.')) {
        bodyContent += `<h3>${trimmed}</h3>\n`;
      } else {
        bodyContent += `<p>${trimmed}</p>\n`;
      }
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
        <h1>Your Article Title <span class="highlight">| Edit This Subtitle</span></h1>
        <p class="intro">Add your introductory paragraph here. This template is for comparison articles.</p>
        <p class="intro">This is your second intro paragraph. Customize as needed.</p>
    </header>

    <div>
        [elementor-template id="1128"]
    </div>

    <!-- Quick Verdict Section -->
    <section class="quick-verdict" aria-labelledby="quick-verdict-heading">
        <div class="qv-header">
            <h2 id="quick-verdict-heading" class="qv-title">Quick Verdict: Your Comparison Title</h2>
            <p class="qv-subtitle">Add your comparison subtitle here.</p>
            <div class="qv-updated">Last updated: <time datetime="2025-11">November 2025</time></div>
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
        ${bodyContent}
    </section>

</article>
</div>

<script>
// Add your JavaScript here
</script>

</body>
</html>`;
  };

  // Generate Single Casino HTML
  const generateSingleCasinoHTML = (text: string): string => {
    const lines = text.split('\n').filter(line => line.trim());

    let bodyContent = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed === trimmed.toUpperCase() && trimmed.length < 100) {
        bodyContent += `<h2>${trimmed}</h2>\n`;
      } else if (trimmed.length < 150 && !trimmed.endsWith('.')) {
        bodyContent += `<h3>${trimmed}</h3>\n`;
      } else {
        bodyContent += `<p>${trimmed}</p>\n`;
      }
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
    <h1>Your Casino/Brand Name Review 2025</h1>
    <p class="intro">Add your introductory paragraph here. This template is for single brand reviews.</p>
    <p class="intro">Second intro paragraph. After extensive testing and analysis, customize your content.</p>
</header>

<div>
    [elementor-template id="1128"]
</div>

<!-- Quick Verdict Section -->
<section class="quick-verdict">
    <div class="qv-header">
        <h2 class="qv-title">Quick Verdict: Your Review Title</h2>
        <p class="qv-subtitle">After extensive testing...</p>
        <div class="qv-updated">Last updated: <time datetime="2025-11">November 2025</time></div>
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

<!-- Main Content -->
<section class="content-section">
    ${bodyContent}
</section>

</article>
</div>

<script>
// Add your JavaScript here
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
          Upload your .docx file, select a template, and convert plain text to styled HTML using your custom templates
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
      {selectedTemplate && extractedText && (
        <div className="mb-8 text-center">
          <button
            onClick={() => convertToHTML(extractedText, selectedTemplate)}
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
                    sandbox="allow-same-origin"
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
          💡 How to Use
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Select the template that best matches your content type</li>
          <li>Upload your Word document (.docx format)</li>
          <li>Click "Convert to HTML" to generate styled HTML</li>
          <li>Preview the output and download or copy the HTML code</li>
          <li>Paste the HTML into your CMS or save it for later use</li>
        </ol>
      </div>
    </div>
  );
}
