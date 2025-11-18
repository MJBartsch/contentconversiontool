# Word to HTML Content Conversion Tool

An automated workflow tool for converting plain text from Word documents (.docx) to styled HTML using custom templates and CSS.

## Features

- **📄 .docx File Upload**: Drag & drop or click to upload Word documents
- **🎨 Template Selection**: Choose between two HTML template structures:
  - **Multi-Casino Comparison**: For comparison articles, listicles, and multiple brand reviews
  - **Single Casino Review**: For in-depth single brand/product reviews
- **👁️ Live Preview**: Split-view interface showing HTML code and live preview side-by-side
- **⬇️ Export Options**:
  - Download as `.html` file
  - Copy HTML to clipboard
- **🎯 Custom Styling**: Uses your custom CSS stylesheet for consistent branding

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Mammoth.js** - .docx file parsing
- **File-saver** - Download functionality

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd contentconversiontool
```

2. Install dependencies:
```bash
npm install
```

3. **(Optional) Configure AI Features**: For AI-powered content analysis
```bash
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key
# Get your key from: https://console.anthropic.com/
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage: Multi-Stage Workflow

### Stage 1: Initial Conversion
1. **Select a Template**: Choose between "Multi-Casino Comparison" or "Single Casino Review"
2. **Upload .docx File**: Click the upload area or drag & drop your Word document
3. **Convert**: Click "Convert to HTML" to generate styled HTML
4. **Preview**: Toggle the live preview to see how your content looks
5. **Next**: Click "Edit & Style Sections" to proceed to Stage 2

### Stage 2: Interactive Section Editor
1. **View Sections**: See all content broken down into editable sections
2. **AI Analysis** (Optional): Click "AI Smart Analysis" for intelligent style suggestions
3. **Apply Styles**: Select from 10+ style templates for each section:
   - Platform Card, Hero Section, FAQ, Feature List, etc.
4. **Reorder**: Move sections up/down to reorganize content
5. **Preview**: Live preview updates with your styling changes
6. **Export**: Save your refined HTML and return to Stage 1

### Final Step
- **Download** the HTML file or **Copy** to clipboard for use in your CMS

## How It Works

### Stage 1: Automated Structure Extraction
1. **File Parsing**: Mammoth.js preserves document structure (headings, lists, tables)
2. **Template Mapping**: Content is intelligently mapped to the selected HTML template
3. **Section Detection**: Automatically identifies FAQs, pros/cons, features, bonuses, etc.
4. **Semantic HTML**: Generates proper heading hierarchy (H2, H3, H4)

### Stage 2: Manual Refinement with AI
1. **Recursive Parsing**: Extracts all content elements from nested HTML structures
2. **AI Analysis** (Optional): Claude AI analyzes content and suggests optimal style templates
3. **Visual Styling**: Apply different styling patterns to each section via visual interface
4. **Live Preview**: See changes in real-time with your custom CSS
5. **Export**: Generate production-ready HTML

## Template Structures

### Multi-Casino Comparison Template
Best for:
- Comparison articles
- Top 10 lists
- Multiple brand reviews
- Feature comparisons

Includes:
- Quick verdict sections
- Comparison tables
- Multiple platform cards
- Trust signals

### Single Casino Review Template
Best for:
- In-depth reviews
- Single product analysis
- Detailed brand coverage

Includes:
- Rating sections
- Tabbed content (Overview, Bonuses, Games, Pros & Cons)
- Stats bars
- Platform details

## Customization

### Adding New Templates

To add a new template, edit `app/components/ConversionTool.tsx`:

1. Add template to `TEMPLATES` object:
```typescript
const TEMPLATES = {
  yourTemplate: {
    name: 'Your Template Name',
    description: 'Template description',
    icon: '🎯',
  },
};
```

2. Create HTML generation function:
```typescript
const generateYourTemplateHTML = (text: string): string => {
  // Your template logic here
  return htmlString;
};
```

3. Add case to `convertToHTML` function

### Updating CSS

Replace `/public/css/styling-test-page-fixed.css` with your custom stylesheet.

## Project Structure

```
contentconversiontool/
├── app/
│   ├── components/
│   │   └── ConversionTool.tsx   # Main conversion component
│   ├── page.tsx                  # Home page
│   └── layout.tsx                # Root layout
├── public/
│   ├── css/
│   │   └── styling-test-page-fixed.css  # Custom stylesheet
│   └── templates/                # Template storage (if needed)
├── package.json
└── README.md
```

## AI Features (Optional)

The tool includes **optional AI-powered analysis** using Anthropic's Claude:

- **Smart Section Detection**: AI analyzes your content and identifies logical sections
- **Style Suggestions**: Automatically suggests the best style template for each section
- **Context Understanding**: Recognizes FAQs, feature lists, comparison tables, etc.
- **Intelligent Grouping**: Groups related content together semantically

To enable AI features:
1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Create `.env.local` file in the project root
3. Add: `ANTHROPIC_API_KEY=your_api_key_here`
4. In Stage 2, click "AI Smart Analysis" button

**Note**: AI features are completely optional. The tool works fully without an API key using rule-based parsing.

## Building for Production

```bash
npm run build
npm start
```

## Completed Features

- ✅ Multi-stage workflow (Initial conversion + Manual refinement)
- ✅ Two HTML template structures (Multi-Casino, Single Casino)
- ✅ Advanced structure preservation (headings, lists, tables)
- ✅ 10+ style templates (Platform Card, Hero, FAQ, Feature List, etc.)
- ✅ AI-powered content analysis (optional)
- ✅ Interactive section editor with live preview
- ✅ Section reordering and deletion
- ✅ Export to HTML file or clipboard

## Future Enhancements

- [ ] More template options
- [ ] Bulk file conversion
- [ ] Cloud storage integration
- [ ] API for programmatic access
- [ ] More export formats (Markdown, JSON, etc.)
- [ ] Custom style template creation
- [ ] Collaborative editing features

## License

[Your License Here]

## Support

For issues or questions, please [create an issue](link-to-issues).
