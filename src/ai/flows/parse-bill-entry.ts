
'use server';

/**
 * @fileOverview An AI-powered parser for extracting and translating book details from a string.
 *
 * - parseAndTranslateEntry - A function that takes a string, parses it for book details, and translates them to Sindhi.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EntryInputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
});

const EntryOutputSchema = z.object({
    titleSindhi: z.string().describe('The translated Sindhi title.'),
    authorSindhi: z.string().describe('The translated Sindhi author name.'),
});

export type ParseAndTranslateOutput = z.infer<typeof EntryOutputSchema>;


export async function parseAndTranslateEntry(title: string, author: string): Promise<ParseAndTranslateOutput> {
  return parseToSindhiFlow({ title, author });
}

const prompt = ai.definePrompt({
  name: 'parseToSindhiPrompt',
  input: { schema: EntryInputSchema },
  output: { schema: EntryOutputSchema },
  prompt: `Translate the following book title and author name into Sindhi.
  If a field is already in Sindhi, return the original input for that field.
  Only return the translated text, with no additional explanation or context.

  Title: {{{title}}}
  Author: {{{author}}}
  `,
});

const parseToSindhiFlow = ai.defineFlow(
  {
    name: 'parseToSindhiFlow',
    inputSchema: EntryInputSchema,
    outputSchema: EntryOutputSchema,
  },
  async ({ title, author }) => {
    if (!title.trim() && !author.trim()) {
      return { titleSindhi: '', authorSindhi: '' };
    }
    const { output } = await prompt({ title, author });
    return output!;
  }
);
