
'use server';

import { parseAndTranslateEntry, ParseAndTranslateOutput } from '@/ai/flows/parse-bill-entry';

export async function parseAndTranslate(title: string, author: string): Promise<{ success: boolean, data?: ParseAndTranslateOutput, error?: string }> {
  try {
    const result = await parseAndTranslateEntry(title, author);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in parsing and translating:', error);
    return { success: false, error: 'Failed to parse or translate details.' };
  }
}

