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
    .default(5)
    .describe('The number of trending products to return.'),
});
export type TrendingProductsInput = z.infer<typeof TrendingProductsInputSchema>;

const TrendingProductsOutputSchema = z.object({
  products: z.array(
    z.object({
      productId: z.string().describe('The ID of the product.'),
      name: z.string().describe('The name of the product.'),
      imageUrl: z.string().describe('URL of product image.'),
      description: z.string().describe('A short description of the product.'),
    })
  ).describe('A list of trending products.'),
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
  
  Ensure each product object includes the productId, name, imageUrl, and description.
  `,
});

const trendingProductsFlow = ai.defineFlow(
  {
    name: 'trendingProductsFlow',
    inputSchema: TrendingProductsInputSchema,
    outputSchema: TrendingProductsOutputSchema,
  },
  async input => {
    const {output} = await trendingProductsPrompt(input);
    return output!;
  }
);
