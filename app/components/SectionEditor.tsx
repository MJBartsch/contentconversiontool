'use client';

import { useState, useRef } from 'react';

interface Section {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'group';
  content: string;
  htmlContent: string;
  styleNode: string;
  order: number;
  level?: number; // for headings
}

interface StyleNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'structure' | 'content' | 'interactive';
  template: (content: string) => string;
}

const STYLE_NODES: Record<string, StyleNode> = {
  body: {
    id: 'body',
    name: 'Body Text',
    description: 'Standard paragraph text',
    icon: '📄',
    category: 'content',
    template: (content) => `<div class="body-text">${content}</div>`,
  },
  platformCard: {
    id: 'platformCard',
    name: 'Platform Card',
    description: 'Casino/platform review card with styling',
    icon: '🎰',
    category: 'structure',
    template: (content) => `
      <div class="platform-card">
        <div class="platform-card__header">
          <div class="platform-card__title-section">
            ${content}
          </div>
        </div>
        <div class="platform-card__body">
          <div class="platform-card__content">
            ${content}
          </div>
        </div>
      </div>`,
  },
  hero: {
    id: 'hero',
    name: 'Hero Section',
    description: 'Large intro section with emphasis',
    icon: '🎯',
    category: 'structure',
    template: (content) => `
      <div class="hero-section">
        <div class="hero-section__content">
          ${content}
        </div>
      </div>`,
  },
  faqItem: {
    id: 'faqItem',
    name: 'FAQ Item',
    description: 'Question and answer format',
    icon: '❓',
    category: 'interactive',
    template: (content) => `
      <div class="faq-item">
        <div class="faq-item__question">
          ${content}
        </div>
        <div class="faq-item__answer">
          ${content}
        </div>
      </div>`,
  },
  comparisonTable: {
    id: 'comparisonTable',
    name: 'Comparison Table',
    description: 'Styled comparison table',
    icon: '📊',
    category: 'content',
    template: (content) => `
      <div class="comparison-table-container">
        <table class="comparison-table">
          ${content}
        </table>
      </div>`,
  },
  featureList: {
    id: 'featureList',
    name: 'Feature List',
    description: 'Highlighted feature list with icons',
    icon: '✨',
    category: 'content',
    template: (content) => `
      <div class="feature-list">
        <ul class="feature-list__items">
          ${content}
        </ul>
      </div>`,
  },
  proscons: {
    id: 'proscons',
    name: 'Pros & Cons',
    description: 'Two-column pros and cons layout',
    icon: '⚖️',
    category: 'content',
    template: (content) => `
      <div class="pros-cons-section">
        <div class="pros-cons-section__grid">
          ${content}
        </div>
      </div>`,
  },
  statsBar: {
    id: 'statsBar',
    name: 'Stats Bar',
    description: 'Visual statistics bar',
    icon: '📈',
    category: 'interactive',
    template: (content) => `
      <div class="stats-bar">
        <div class="stats-bar__content">
          ${content}
        </div>
      </div>`,
  },
  tabContent: {
    id: 'tabContent',
    name: 'Tab Content',
    description: 'Content within a tab',
    icon: '📑',
    category: 'structure',
    template: (content) => `
      <div class="tab-content">
        ${content}
      </div>`,
  },
  heading: {
    id: 'heading',
    name: 'Heading',
    description: 'Section heading',
    icon: '📌',
    category: 'structure',
    template: (content) => `<h2 class="section-heading">${content}</h2>`,
  },
};

interface SectionEditorProps {
  initialHtml: string;
  onSave: (html: string) => void;
  onBack: () => void;
}

export default function SectionEditor({ initialHtml, onSave, onBack }: SectionEditorProps) {
  const [sections, setSections] = useState<Section[]>(() => parseHtmlIntoSections(initialHtml));
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    sections.length > 0 ? sections[0].id : null
  );
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Parse HTML into editable sections - recursively traverse nested structures
  function parseHtmlIntoSections(html: string): Section[] {
    if (typeof window === 'undefined') return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const sections: Section[] = [];
    let order = 0;

    // Recursively extract content elements
    function extractContent(element: Element) {
      const tagName = element.tagName.toLowerCase();

      // Content elements we want to capture
      if (tagName.match(/^h[1-6]$/)) {
        const level = parseInt(tagName[1]);
        sections.push({
          id: `section-${order}`,
          type: 'heading',
          content: element.textContent || '',
          htmlContent: element.outerHTML,
          styleNode: 'heading',
          order: order++,
          level,
        });
      } else if (tagName === 'p' && element.textContent?.trim()) {
        sections.push({
          id: `section-${order}`,
          type: 'paragraph',
          content: element.textContent || '',
          htmlContent: element.outerHTML,
          styleNode: 'body',
          order: order++,
        });
      } else if (tagName === 'ul' || tagName === 'ol') {
        sections.push({
          id: `section-${order}`,
          type: 'list',
          content: element.textContent || '',
          htmlContent: element.outerHTML,
          styleNode: 'featureList',
          order: order++,
        });
      } else if (tagName === 'table') {
        sections.push({
          id: `section-${order}`,
          type: 'table',
          content: element.textContent || '',
          htmlContent: element.outerHTML,
          styleNode: 'comparisonTable',
          order: order++,
        });
      } else {
        // For container elements, traverse children
        Array.from(element.children).forEach((child) => {
          extractContent(child);
        });
      }
    }

    // Start extraction from body
    Array.from(doc.body.children).forEach((child) => {
      extractContent(child);
    });

    return sections;
  }

  // AI-powered content analysis
  async function analyzeWithAI() {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: initialHtml,
          styleNodes: STYLE_NODES,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze content');
      }

      const { sections: aiSections } = await response.json();

      // Map AI suggestions to our section format
      const newSections: Section[] = aiSections.map((aiSection: any, index: number) => ({
        id: `section-${index}`,
        type: aiSection.type,
        content: aiSection.content,
        htmlContent: aiSection.htmlContent,
        styleNode: aiSection.suggestedStyle || 'body',
        order: index,
        level: aiSection.type === 'heading' ? 2 : undefined,
      }));

      setSections(newSections);
      if (newSections.length > 0) {
        setSelectedSectionId(newSections[0].id);
      }

      alert(`AI Analysis complete! Found ${newSections.length} sections with smart style suggestions.`);
    } catch (error) {
      console.error('AI analysis failed:', error);
      alert(error instanceof Error ? error.message : 'AI analysis failed. Using basic parsing.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Update preview when sections change
  const updatePreview = () => {
    const fullHtml = generateFinalHtml();
    setPreviewHtml(fullHtml);

    if (previewRef.current) {
      const iframeDoc = previewRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(fullHtml);
        iframeDoc.close();
      }
    }
  };

  // Generate final HTML from sections
  const generateFinalHtml = (): string => {
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    const bodyContent = sortedSections
      .map((section) => {
        const styleNode = STYLE_NODES[section.styleNode];
        if (styleNode) {
          return styleNode.template(section.htmlContent);
        }
        return section.htmlContent;
      })
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/css/styling-test-page-fixed.css">
  <title>Preview</title>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
  };

  // Update section style node
  const updateSectionStyle = (sectionId: string, styleNodeId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, styleNode: styleNodeId } : section
      )
    );
  };

  // Move section up or down
  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSections((prev) => {
      const index = prev.findIndex((s) => s.id === sectionId);
      if (index === -1) return prev;

      const newSections = [...prev];
      if (direction === 'up' && index > 0) {
        [newSections[index - 1].order, newSections[index].order] = [
          newSections[index].order,
          newSections[index - 1].order,
        ];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      } else if (direction === 'down' && index < newSections.length - 1) {
        [newSections[index + 1].order, newSections[index].order] = [
          newSections[index].order,
          newSections[index + 1].order,
        ];
        [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
      }

      return newSections;
    });
  };

  // Delete section
  const deleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const handleSave = () => {
    const finalHtml = generateFinalHtml();
    onSave(finalHtml);
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stage 2: Section Editor</h1>
            <p className="text-sm text-gray-600 mt-1">
              Assign style templates to sections and preview the final output
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Stage 1
            </button>
            <button
              onClick={analyzeWithAI}
              disabled={isAnalyzing}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? '🤖 Analyzing...' : '🤖 AI Smart Analysis'}
            </button>
            <button
              onClick={updatePreview}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Preview
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Save & Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Section List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Sections ({sections.length})
            </h2>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSectionId === section.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedSectionId(section.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{STYLE_NODES[section.styleNode]?.icon || '📄'}</span>
                        <span className="text-xs font-medium text-gray-500">
                          {section.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 truncate">
                        {section.content.substring(0, 50)}
                        {section.content.length > 50 ? '...' : ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Style: {STYLE_NODES[section.styleNode]?.name || 'None'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(section.id, 'up');
                        }}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(section.id, 'down');
                        }}
                        disabled={index === sections.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Panel: Section Editor */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-6">
            {selectedSection ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Edit Section</h2>
                    <button
                      onClick={() => deleteSection(selectedSection.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    >
                      Delete Section
                    </button>
                  </div>

                  {/* Style Node Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Style Template
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.values(STYLE_NODES).map((styleNode) => (
                        <button
                          key={styleNode.id}
                          onClick={() => updateSectionStyle(selectedSection.id, styleNode.id)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedSection.styleNode === styleNode.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{styleNode.icon}</div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {styleNode.name}
                          </div>
                          <div className="text-xs text-gray-500">{styleNode.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section Content Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Preview
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Type: {selectedSection.type}</p>
                      <div className="bg-white p-4 rounded border border-gray-200 max-h-96 overflow-auto">
                        <div dangerouslySetInnerHTML={{ __html: selectedSection.htmlContent }} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Select a section from the left panel to edit
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="w-1/2 bg-gray-100 border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Live Preview
            </h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ minHeight: '600px' }}>
              <iframe
                ref={previewRef}
                title="Preview"
                className="w-full h-full"
                style={{ minHeight: '600px', border: 'none' }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
