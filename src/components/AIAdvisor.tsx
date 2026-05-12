"use client";

import { useState } from "react";
import { useFinancialStore } from "@/lib/store";
import { smartGrowthAdvisor, SmartGrowthAdvisorOutput } from "@/ai/flows/smart-growth-advisor";
import { GlassCard } from "./GlassCard";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles, Loader2, AlertCircle, TrendingUp, ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react";

export function AIAdvisor({ store, onBack }: { store: ReturnType<typeof useFinancialStore>, onBack: () => void }) {
  const [result, setResult] = useState<SmartGrowthAdvisorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAdvice = async () => {
    setIsLoading(true);
    try {
      const advice = await smartGrowthAdvisor({
        currentGoldPriceUSDPerGram: store.data.goldPrice,
        goldMarketTrendAnalysis: "The market is showing moderate volatility with a long-term bullish outlook.",
        goldDebts: store.data.goldDebts.map(d => ({
          id: d.id,
          name: d.name,
          amountGrams: d.amountGrams || 0,
          initialPriceUSDPerGram: d.initialPriceUSDPerGram || store.data.goldPrice
        }))
      });
      setResult(advice);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" /> Growth Engine
        </div>
        <div className="w-10" />
      </div>

      <div className="px-2 space-y-2">
        <h2 className="text-3xl font-bold font-headline text-white leading-tight">AI Advisor</h2>
        <p className="text-muted-foreground text-xs leading-relaxed">Optimizing liabilities using real-time market data.</p>
      </div>

      {!result && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/5 rounded-[3rem] border border-white/5 space-y-6 px-8 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-primary/5 flex items-center justify-center">
            <BrainCircuit className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="text-white font-bold">Analyze Strategy?</h3>
          <Button onClick={getAdvice} className="h-16 w-full rounded-2xl bg-primary text-lg font-bold">Run Strategy Engine</Button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-white/70 text-sm animate-pulse">Scanning market signals...</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <GlassCard variant="indigo" className="p-6 rounded-[2rem]">
            <h3 className="text-sm font-bold text-primary uppercase mb-3">Brief</h3>
            <p className="text-white text-sm leading-relaxed">{result?.overallRecommendationSummary}</p>
          </GlassCard>
          <div className="space-y-4">
            {result?.repaymentStrategies.map((strategy, i) => (
              <GlassCard key={i} className="rounded-[2rem] p-6 border-white/10 flex flex-col gap-4">
                <div className={`px-2 py-0.5 w-fit rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                    strategy.priority === 'High' ? 'bg-destructive/20 text-destructive' : 'bg-accent/20 text-accent'
                }`}>
                  {strategy.priority} Priority
                </div>
                <h4 className="text-lg font-bold text-white">{strategy.strategyName}</h4>
                <p className="text-[11px] text-white/60 leading-relaxed">{strategy.description}</p>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[9px] text-white/40 mb-1 uppercase tracking-widest font-bold">Financial Impact</p>
                  <p className="text-xs font-bold text-white">{strategy.estimatedFinancialImpact}</p>
                </div>
              </GlassCard>
            ))}
          </div>
          <Button variant="outline" onClick={getAdvice} className="w-full rounded-2xl border-white/10 h-12 font-bold"><RefreshCw className="w-4 h-4 mr-2" /> Recalculate</Button>
        </div>
      )}
    </div>
  );
}