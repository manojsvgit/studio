// src/ai/flows/trending-products.ts
'use server';

/**
 * @fileOverview AI agent that returns a list of trending products.
 *
 * - getTrendingProducts - A function that returns a list of trending products.
 * - TrendingProductsInput - The input type for the getTrendingProducts function.
 * - TrendingProductsOutput - The return type for the getTrendingProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrendingProductsInputSchema = z.object({
  count: z
    .number()
    .default(4) // Default to 4 to fit nicely in a row
    .describe('The number of trending products to return.'),
});
export type TrendingProductsInput = z.infer<typeof TrendingProductsInputSchema>;

const TrendingProductItemSchema = z.object({
  productId: z.string().describe('The unique ID of the product.'),
  name: z.string().describe('The name of the product.'),
  imageUrl: z.string().url().describe('URL of product image. Should be a placeholder like https://placehold.co/600x400.png.'),
  description: z.string().describe('A short description of the product.'),
  price: z.number().positive().describe('The price of the product in USD.'),
  category: z.string().describe('The main category of the product (e.g., Electronics, Groceries, Fashion).'),
  dataAiHint: z.string().optional().describe('One or two keywords for image search (e.g., "milk carton", "smartphone device").'),
});

const TrendingProductsOutputSchema = z.object({
  products: z.array(TrendingProductItemSchema).describe('A list of trending products.'),
});
export type TrendingProductsOutput = z.infer<typeof TrendingProductsOutputSchema>;

export async function getTrendingProducts(input: TrendingProductsInput): Promise<TrendingProductsOutput> {
  return trendingProductsFlow(input);
}

const trendingProductsPrompt = ai.definePrompt({
  name: 'trendingProductsPrompt',
  input: {schema: TrendingProductsInputSchema},
  output: {schema: TrendingProductsOutputSchema},
  prompt: `You are an e-commerce expert. You know all of the trending products for sale at Walmart.

  Based on that knowledge, return a JSON list of the {{count}} most trending products sold at Walmart.
  
  Ensure each product object includes:
  - productId (a unique string, e.g., "walmart_trend_001")
  - name (e.g., "Latest Smartwatch Model X")
  - imageUrl (use a placeholder like "https://placehold.co/600x400.png")
  - description (a concise marketing description)
  - price (a number, e.g., 49.99)
  - category (e.g., "Electronics", "Home Goods", "Fashion")
  - dataAiHint (one or two keywords for the image, e.g., "smartwatch gadget")
  `,
   config: {
    temperature: 0.7, // Add some creativity
  },
});

const trendingProductsFlow = ai.defineFlow(
  {
    name: 'trendingProductsFlow',
    inputSchema: TrendingProductsInputSchema,
    outputSchema: TrendingProductsOutputSchema,
  },
  async input => {
    const {output} = await trendingProductsPrompt(input);
    if (!output) {
      // Handle potential null output from the prompt
      console.error("Trending products prompt returned null output");
      return { products: [] };
    }
     // Ensure dataAiHint is present, fallback to name
    const productsWithHint = output.products.map(p => ({
      ...p,
      dataAiHint: p.dataAiHint || p.name.split(' ').slice(0, 2).join(' ').toLowerCase(),
      imageUrl: p.imageUrl || 'https://placehold.co/600x400.png', // Ensure imageUrl has a fallback
    }));
    return { products: productsWithHint };
  }
);

