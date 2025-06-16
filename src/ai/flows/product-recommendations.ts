// src/ai/flows/product-recommendations.ts
'use server';

/**
 * @fileOverview A product recommendation AI agent.
 *
 * - getProductRecommendations - A function that handles the product recommendation process.
 * - ProductRecommendationsInput - The input type for the getProductRecommendations function.
 * - ProductRecommendationsOutput - The return type for the getProductRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductRecommendationsInputSchema = z.object({
  userId: z.string().describe('The ID of the user for whom to generate recommendations.'),
  browsingHistory: z
    .array(z.string())
    .describe('An array of product IDs representing the user\'s browsing history.'),
  purchaseHistory: z
    .array(z.string())
    .describe('An array of product IDs representing the user\'s purchase history.'),
});
export type ProductRecommendationsInput = z.infer<typeof ProductRecommendationsInputSchema>;

const ProductRecommendationsOutputSchema = z.object({
  recommendedProducts: z
    .array(z.string())
    .describe('An array of product IDs that are recommended for the user.'),
  trendingProducts: z
    .array(z.string())
    .describe('An array of product IDs that are currently trending on the platform.'),
});
export type ProductRecommendationsOutput = z.infer<typeof ProductRecommendationsOutputSchema>;

export async function getProductRecommendations(input: ProductRecommendationsInput): Promise<ProductRecommendationsOutput> {
  return productRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productRecommendationsPrompt',
  input: {schema: ProductRecommendationsInputSchema},
  output: {schema: ProductRecommendationsOutputSchema},
  prompt: `You are an expert e-commerce product recommendation engine.

You will generate personalized product recommendations based on the user's browsing history and purchase behavior.
You will also identify trending products on the platform that the user might be interested in.

User ID: {{{userId}}}
Browsing History: {{#each browsingHistory}}{{{this}}}, {{/each}}
Purchase History: {{#each purchaseHistory}}{{{this}}}, {{/each}}

Based on this information, provide an array of recommended product IDs and an array of trending product IDs.
`,
});

const productRecommendationsFlow = ai.defineFlow(
  {
    name: 'productRecommendationsFlow',
    inputSchema: ProductRecommendationsInputSchema,
    outputSchema: ProductRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
