'use server';

import { parseBillEntry, ParseBillEntryOutput } from '@/ai/flows/parse-bill-entry';

export async function parseBillEntryAction(
  text: string
): Promise<{ success: boolean; data?: ParseBillEntryOutput; error?: string }> {
  if (!text) {
    return { success: false, error: 'Input text cannot be empty.' };
  }

  try {
    const result = await parseBillEntry(text);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error parsing bill entry:', error);
    return { success: false, error: 'Failed to parse bill details. Please try again.' };
  }
}
export { parseBillEntry };

  