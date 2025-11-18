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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Select a Template**: Choose between "Multi-Casino Comparison" or "Single Casino Review"
2. **Upload .docx File**: Click the upload area or drag & drop your Word document
3. **Convert**: Click "Convert to HTML" to generate styled HTML
4. **Preview**: Toggle the live preview to see how your content looks
5. **Export**: Download the HTML file or copy it to clipboard

## How It Works

1. **File Parsing**: Mammoth.js extracts raw text from your .docx file
2. **Template Mapping**: The text is intelligently mapped to the selected HTML template structure
3. **Styling**: Your custom CSS classes are applied automatically
4. **Preview**: Live preview renders the HTML with your stylesheet
5. **Export**: Download or copy the complete HTML for use in your CMS

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

## Building for Production

```bash
npm run build
npm start
```

## Future Enhancements

- [ ] More template options
- [ ] Advanced text parsing (preserve formatting, lists, tables)
- [ ] Bulk file conversion
- [ ] Cloud storage integration
- [ ] API for programmatic access
- [ ] More export formats (Markdown, JSON, etc.)

## License

[Your License Here]

## Support

For issues or questions, please [create an issue](link-to-issues).
