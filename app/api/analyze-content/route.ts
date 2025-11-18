import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { html, styleNodes } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const styleNodesList = Object.entries(styleNodes)
      .map(([id, node]: [string, any]) => `- ${id}: ${node.name} - ${node.description}`)
      .join('\n');

    const prompt = `You are an expert content analyzer for HTML conversion. Analyze the following HTML content and break it down into logical sections. For each section, suggest the most appropriate style template.

Available style templates:
${styleNodesList}

HTML to analyze:
${html}

Analyze this HTML and return a JSON array of sections. Each section should have:
- type: 'heading' | 'paragraph' | 'list' | 'table' | 'group'
- content: Plain text content (first 100 chars)
- htmlContent: The actual HTML for this section
- suggestedStyle: The ID of the most appropriate style template
- reasoning: Brief explanation of why this style fits

Break down nested structures intelligently. Group related content together when appropriate. Focus on semantic meaning and context.

Return ONLY valid JSON, no additional text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response (in case Claude adds any wrapper text)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const sections = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
