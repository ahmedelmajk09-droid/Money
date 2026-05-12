'use server';
/**
 * @fileOverview A GenAI flow for generating simulated wealth forecasts based on user financial data and market conditions.
 *
 * - dynamicBalanceForecast - A function that handles the wealth forecast process.
 * - DynamicBalanceForecastInput - The input type for the dynamicBalanceForecast function.
 * - DynamicBalanceForecastOutput - The return type for the dynamicBalanceForecast function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DynamicBalanceForecastInputSchema = z.object({
  currentCash: z.number().describe('The user\'s current cash balance.'),
  goldDebtGrams: z.number().describe('The user\'s current gold debt in grams.'),
  cashDebt: z.number().describe('The user\'s current cash debt.'),
  currentGoldPricePerGram: z.number().describe('The current market price of gold per gram (e.g., in USD).'),
  initialGoldPricePerGram: z.number().describe('The gold price per gram at the time the gold debt was incurred.'),
  averageMonthlySpending: z.number().describe('The user\'s average monthly spending.'),
  monthlyIncome: z.number().describe('The user\'s average monthly income.'),
  investmentRiskTolerance: z.enum(['low', 'medium', 'high']).describe('The user\'s investment risk tolerance (low, medium, or high).'),
  forecastPeriodMonths: z.number().int().min(1).max(24).describe('The number of months to forecast into the future (1-24).'),
  goldPriceVolatilityFactor: z.enum(['stable', 'moderate', 'high']).describe('Describes the expected volatility of gold prices (stable, moderate, or high).'),
});
export type DynamicBalanceForecastInput = z.infer<typeof DynamicBalanceForecastInputSchema>;

const DynamicBalanceForecastOutputSchema = z.object({
  forecastDescription: z.string().describe('A comprehensive description and summary of the financial forecast.'),
  projectedBalances: z.array(z.object({
    month: z.number().int().describe('The month number relative to the start (e.g., 1 for the first month).'),
    projectedCash: z.number().describe('The projected cash balance for the month.'),
    projectedGoldPrice: z.number().describe('The simulated gold price for the month.'),
    projectedTotalBalance: z.number().describe('The projected total balance for the month, considering cash, gold debt, and gold price.'),
    notes: z.string().optional().describe('Any specific notes or events for this month (e.g., "Gold price increased significantly due to geopolitical events").'),
  })).describe('An array of projected financial outcomes for each month.'),
  goldPriceAssumptions: z.string().describe('A detailed explanation of the gold price fluctuation assumptions made in the forecast, based on the volatility factor.'),
  spendingHabitImpact: z.string().describe('An analysis of how current spending habits impact the long-term forecast and potential areas for adjustment.'),
  recommendations: z.string().describe('Actionable recommendations for financial planning based on the forecast, considering spending, debt, and gold investments.'),
});
export type DynamicBalanceForecastOutput = z.infer<typeof DynamicBalanceForecastOutputSchema>;

export async function dynamicBalanceForecast(input: DynamicBalanceForecastInput): Promise<DynamicBalanceForecastOutput> {
  return dynamicBalanceForecastFlow(input);
}

const dynamicBalanceForecastPrompt = ai.definePrompt({
  name: 'dynamicBalanceForecastPrompt',
  input: { schema: DynamicBalanceForecastInputSchema },
  output: { schema: DynamicBalanceForecastOutputSchema },
  prompt: `You are a sophisticated financial advisor providing a wealth forecast for a personal finance tracker application named 'Gilded Pulse'.

The user wants a simulated wealth forecast based on their current financial situation, spending habits, and gold price volatility. Your forecast should consider a period of {{forecastPeriodMonths}} months.

Here is the user's financial data:
- Current Cash: {{{currentCash}}}
- Gold Debt (Grams): {{{goldDebtGrams}}}
- Cash Debt: {{{cashDebt}}}
- Current Gold Price per Gram: {{{currentGoldPricePerGram}}}
- Initial Gold Price per Gram (when gold debt was incurred): {{{initialGoldPricePerGram}}}
- Average Monthly Spending: {{{averageMonthlySpending}}}
- Monthly Income: {{{monthlyIncome}}}
- Investment Risk Tolerance: {{{investmentRiskTolerance}}}
- Gold Price Volatility Factor: {{{goldPriceVolatilityFactor}}}

**Instructions:**
1.  **Initial Balance Calculation**: Calculate the user's current total balance. The formula is: Total Balance = Current Cash + (Gold Debt (Grams) * Current Gold Price per Gram) - Cash Debt.
2.  **Monthly Simulation**: Simulate the financial changes month-by-month for the specified forecast period. For each month:
    *   **Cash Flow**: Adjust the projected cash balance based on 'Monthly Income' minus 'Average Monthly Spending'. Assume these are consistent unless explicitly varied due to other factors you introduce.
    *   **Gold Price Fluctuation**: Simulate a plausible gold price change based on the 'Gold Price Volatility Factor' and 'Investment Risk Tolerance'.
        *   **Stable**: Minimal fluctuation (e.g., +/- 0-0.5% per month).
        *   **Moderate**: Moderate fluctuation (e.g., +/- 0.5-2% per month).
        *   **High**: Significant fluctuation (e.g., +/- 2-5% per month), possibly with some larger swings. 
        Consider the 'Investment Risk Tolerance' when describing the impact of these fluctuations. A 'high' risk tolerance might imply the user is prepared for larger swings, while 'low' suggests they prefer stability.
    *   **Total Balance Recalculation**: Recalculate the 'projectedTotalBalance' using the formula: Projected Total Balance = Projected Cash + (Gold Debt (Grams) * Simulated Gold Price) - Cash Debt.
    *   **Notes**: Add concise 'notes' for any significant gold price changes, market events, or financial milestones in a given month.
3.  **Forecast Description**: Provide an overall 'forecastDescription' summarizing the financial trajectory, key insights, and an outlook based on the simulation.
4.  **Gold Price Assumptions**: Detail the specific 'goldPriceAssumptions' made for the simulation, linking them to the 'Gold Price Volatility Factor' and 'Investment Risk Tolerance'.
5.  **Spending Habit Impact**: Analyze how 'spendingHabitImpact' affects the forecast and whether current habits are sustainable or detrimental.
6.  **Recommendations**: Offer practical and actionable 'recommendations' to the user to optimize their financial position based on the forecast.

Ensure that your output strictly adheres to the 'DynamicBalanceForecastOutputSchema' provided.`,
});

const dynamicBalanceForecastFlow = ai.defineFlow(
  {
    name: 'dynamicBalanceForecastFlow',
    inputSchema: DynamicBalanceForecastInputSchema,
    outputSchema: DynamicBalanceForecastOutputSchema,
  },
  async (input) => {
    const { output } = await dynamicBalanceForecastPrompt(input);
    return output!;
  }
);
