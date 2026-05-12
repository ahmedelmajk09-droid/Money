
"use client";

import { useState } from "react";
import { useFinancialStore } from "@/lib/store";
import { dynamicBalanceForecast, DynamicBalanceForecastOutput } from "@/ai/flows/dynamic-balance-forecast-flow";
import { GlassCard } from "./GlassCard";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, Area, AreaChart, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import { Sparkles, Loader2, Landmark, History, Wallet, Info, ArrowLeft } from "lucide-react";

export function ForecastTool({ store, onBack }: { store: ReturnType<typeof useFinancialStore>, onBack: () => void }) {
  const [result, setResult] = useState<DynamicBalanceForecastOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runForecast = async () => {
    setIsLoading(true);
    try {
      const forecast = await dynamicBalanceForecast({
        currentCash: store.data.cashBalance,
        goldDebtGrams: store.data.goldDebts.reduce((acc, d) => acc + (d.amountGrams - d.paidAmountGrams), 0),
        cashDebt: store.data.goldDebts.reduce((acc, d) => acc + (d.amountEGP ? (d.amountEGP - d.paidAmountEGP) : 0), 0),
        currentGoldPricePerGram: store.data.goldPrice,
        initialGoldPricePerGram: store.data.goldDebts[0]?.initialPriceUSDPerGram || store.data.goldPrice,
        averageMonthlySpending: 2000,
        monthlyIncome: 3500,
        investmentRiskTolerance: 'medium',
        forecastPeriodMonths: 12,
        goldPriceVolatilityFactor: 'moderate',
      });
      setResult(forecast);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-sm text-white/70">Wealth Forecast</h2>
          <p className="text-xs text-white/40">AI Prediction</p>
        </div>
        <div className="w-10" />
      </div>

      {!result && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[3rem] border border-white/5 text-center px-10 space-y-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Predict Your Growth</h3>
            <p className="text-white/30 text-xs italic leading-relaxed">
              Based on your current {store.data.goldDebts.length} active debts and cash balance, we'll project your net wealth for the next 12 months.
            </p>
          </div>
          <Button onClick={runForecast} className="w-full bg-primary h-14 rounded-2xl font-bold text-base shadow-lg shadow-primary/10">
            <Landmark className="w-5 h-5 mr-2" />
            Generate Forecast
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <Sparkles className="w-4 h-4 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white/70 text-sm font-medium animate-pulse">Running Monte Carlo Simulations...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <GlassCard className="p-0 overflow-hidden rounded-[2.5rem]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold font-headline text-white mb-1 uppercase tracking-widest">Growth Path</h3>
                <p className="text-[10px] text-white/40">12 Month Projection</p>
              </div>
              <Button onClick={runForecast} size="sm" variant="outline" className="h-8 text-[10px] rounded-full border-white/10">Refresh</Button>
            </div>
            <div className="h-56 w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result?.projectedBalances}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1c1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="projectedTotalBalance" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 gap-4">
            <GlassCard variant="indigo" className="p-6 rounded-[2rem]">
              <div className="flex items-center gap-2 mb-3 text-white">
                <Info className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-xs uppercase tracking-widest text-primary">Assumptions</h4>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">{result?.goldPriceAssumptions}</p>
            </GlassCard>
            <GlassCard variant="azure" className="p-6 rounded-[2rem]">
              <div className="flex items-center gap-2 mb-3 text-white">
                <Wallet className="w-4 h-4 text-accent" />
                <h4 className="font-bold text-xs uppercase tracking-widest text-accent">Analysis</h4>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">{result?.spendingHabitImpact}</p>
            </GlassCard>
          </div>

          <GlassCard className="bg-primary/5 border-primary/10 p-6 rounded-[2rem]">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">AI Advisor Conclusion</h4>
            <p className="text-white/80 text-xs leading-relaxed italic border-l-2 border-primary pl-4">
              {result?.forecastDescription}
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
