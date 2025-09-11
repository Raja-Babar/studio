
'use server';

import { translateText } from '@/ai/flows/translate-text';

export async function translateBookTitle(
    text: string
): Promise<{ success: boolean; translatedText?: string; error?: string }> {
  if (!text.trim()) {
    return { success: true, translatedText: '' };
  }

  try {
    const result = await translateText({ text, targetLanguage: 'Sindhi' });
    return { success: true, translatedText: result.translatedText };
  } catch (error) {
    console.error('Error translating text:', error);
    return { success: false, error: 'Failed to translate text. Please try again.' };
  }
}
