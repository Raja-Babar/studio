'use server';
/**
 * @fileOverview An AI flow to parse natural language text into a structured bill entry.
 *
 * - parseBillEntry - A function that takes a string and returns a structured bill entry object.
 * - ParseBillEntryOutput - The return type for the parseBillEntry function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ParseBillEntryOutputSchema = z.object({
  bookTitle: z.string().describe('The title of the book, including the author if provided.'),
  purchaserName: z.string().describe('The name of the person purchasing the book(s).'),
  quantity: z.number().describe('The number of books being purchased.'),
  unitPrice: z.number().describe('The price for a single unit of the book.'),
  discount: z.number().describe('The discount percentage to be applied. Default to 0 if not mentioned.'),
});
export type ParseBillEntryOutput = z.infer<typeof ParseBillEntryOutputSchema>;

export async function parseBillEntry(text: string): Promise<ParseBillEntryOutput> {
  return parseBillEntryFlow(text);
}

const prompt = ai.definePrompt({
  name: 'parseBillEntryPrompt',
  input: { schema: z.string() },
  output: { schema: ParseBillEntryOutputSchema },
  prompt: `You are an expert at parsing unstructured text into structured data for a bill.
  The user will provide a sentence in English, Urdu, or Sindhi describing a book sale.
  Extract the following information:
  - Book Title (and Author if present)
  - Purchaser's Name
  - Quantity of books
  - Unit Price of the book
  - Discount percentage (if any, otherwise default to 0)

  Here are some examples:
  User input: "2 copies of 'History of Sindh' for Ali Khan at 500 each with a 10% discount."
  Your output: { "bookTitle": "History of Sindh", "purchaserName": "Ali Khan", "quantity": 2, "unitPrice": 500, "discount": 10 }

  User input: "سنڌ جي تاريخ جون 5 ڪاپيون احمد لاءِ، هر هڪ 750 روپيا."
  Your output: { "bookTitle": "سنڌ جي تاريخ", "purchaserName": "احمد", "quantity": 5, "unitPrice": 750, "discount": 0 }

  User input: "1 copy of The Great Gatsby for Sara at 1200."
  Your output: { "bookTitle": "The Great Gatsby", "purchaserName": "Sara", "quantity": 1, "unitPrice": 1200, "discount": 0 }

  Now, parse the following text:
  {{{input}}}
  `,
});

const parseBillEntryFlow = ai.defineFlow(
  {
    name: 'parseBillEntryFlow',
    inputSchema: z.string(),
    outputSchema: ParseBillEntryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

  