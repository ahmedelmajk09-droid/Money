'use server';
/**
 * @fileOverview A Smart Growth Advisor AI agent that analyzes gold market trends
 * and gold-denominated debts to provide repayment strategies.
 *
 * - smartGrowthAdvisor - A function that handles the smart growth advisory process.
 * - SmartGrowthAdvisorInput - The input type for the smartGrowthAdvisor function.
 * - SmartGrowthAdvisorOutput - The return type for the smartGrowthAdvisor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SmartGrowthAdvisorInputSchema = z.object({
  currentGoldPriceUSDPerGram: z.number().describe('The current market price of gold in USD per gram.'),
  goldMarketTrendAnalysis: z.string().describe('A summary of recent gold market trends and future predictions.'),
  goldDebts: z.array(
    z.object({
      id: z.string().describe('Unique identifier for the debt.'),
      name: z.string().describe('A descriptive name for the debt (e.g., "Loan for jewelry").'),
      amountGrams: z.number().describe('The amount of gold in grams for this debt.'),
      initialPriceUSDPerGram: z.number().describe('The price of gold per gram when the debt was incurred.'),
    })
  ).describe('An array of current gold debts the user has.'),
});
export type SmartGrowthAdvisorInput = z.infer<typeof SmartGrowthAdvisorInputSchema>;

const SmartGrowthAdvisorOutputSchema = z.object({
  overallRecommendationSummary: z.string().describe('A high-level summary of the AI advisor\'s recommendations.'),
  repaymentStrategies: z.array(
    z.object({
      strategyName: z.string().describe('A concise name for the recommended strategy (e.g., "Prioritize High-Loss Debts").'),
      description: z.string().describe('A detailed explanation of the repayment strategy.'),
      priority: z.enum(['High', 'Medium', 'Low']).describe('The importance or urgency of the strategy.'),
      estimatedFinancialImpact: z.string().describe('A brief description of the estimated financial impact of implementing this strategy (e.g., "Potentially save $500").'),
    })
  ).describe('An array of recommended repayment strategies for gold-denominated debts.'),
});
export type SmartGrowthAdvisorOutput = z.infer<typeof SmartGrowthAdvisorOutputSchema>;

export async function smartGrowthAdvisor(input: SmartGrowthAdvisorInput): Promise<SmartGrowthAdvisorOutput> {
  return smartGrowthAdvisorFlow(input);
}

const smartGrowthAdvisorPrompt = ai.definePrompt({
  name: 'smartGrowthAdvisorPrompt',
  input: { schema: SmartGrowthAdvisorInputSchema },
  output: { schema: SmartGrowthAdvisorOutputSchema },
  prompt: `You are a Smart Growth Advisor specializing in personal finance, particularly with gold-denominated debts. Your goal is to provide proactive, personalized recommendations on optimal repayment strategies to minimize financial burden, considering current gold market trends.

Here is the user's current financial situation regarding gold debts:

Current Gold Market Data:
- Current Gold Price (USD per Gram): {{{currentGoldPriceUSDPerGram}}}
- Gold Market Trend Analysis: {{{goldMarketTrendAnalysis}}}

User's Gold Debts:
{{#if goldDebts}}
  {{#each goldDebts}}
    Debt Record:
    - Name: {{{name}}}
    - Amount (Grams): {{{amountGrams}}}
    - Initial Price (USD per Gram): {{{initialPriceUSDPerGram}}}
  {{/each}}
{{else}}
  No gold debts currently recorded.
{{/if}}

Analyze the provided gold market trends and the user's gold-denominated debts. For each debt, calculate its current value (amountGrams * currentGoldPriceUSDPerGram) and the gain/loss relative to its initial price (current value - initial value (amountGrams * initialPriceUSDPerGram)). Based on this analysis, identify any debts that are currently incurring significant losses or gains, and propose concrete, actionable repayment strategies. Each strategy should include its name, a detailed description, a priority level (High, Medium, or Low), and an estimated financial impact (e.g., "Potentially save $500 by avoiding further loss," or "Could lead to an extra $100 gain if gold rises.").

Focus on minimizing the financial burden and optimizing for potential future market movements. If there are no gold debts, advise on general financial prudence related to gold investments/debts.

Ensure that your output strictly adheres to the 'SmartGrowthAdvisorOutputSchema' provided.`,
});

const smartGrowthAdvisorFlow = ai.defineFlow(
  {
    name: 'smartGrowthAdvisorFlow',
    inputSchema: SmartGrowthAdvisorInputSchema,
    outputSchema: SmartGrowthAdvisorOutputSchema,
  },
  async (input) => {
    const { output } = await smartGrowthAdvisorPrompt(input);
    return output!;
  }
);
