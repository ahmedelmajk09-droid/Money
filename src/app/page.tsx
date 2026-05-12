
"use client";

import { useState } from "react";
import { Home as HomeIcon, Users, CreditCard, Receipt, Sparkles } from "lucide-react";
import { useFinancialStore } from "@/lib/store";
import { Dashboard } from "@/components/Dashboard";
import { DebtLedger } from "@/components/DebtLedger";
import { WalletManager } from "@/components/WalletManager";
import { BillManager } from "@/components/BillManager";
import { AIAdvisor } from "@/components/AIAdvisor";

export default function Home() {
  const store = useFinancialStore();
  const [activeTab, setActiveTab] = useState("home");

  if (!store.isLoaded) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#020617]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="iphone-frame">
      <div className="content-scroll">
        <div className="view-enter">
          {activeTab === "home" && <Dashboard store={store} onNavigate={setActiveTab} />}
          {activeTab === "debts" && <DebtLedger store={store} onBack={() => setActiveTab('home')} />}
          {activeTab === "wallet" && <WalletManager store={store} onBack={() => setActiveTab('home')} />}
          {activeTab === "bills" && <BillManager store={store} onBack={() => setActiveTab('home')} />}
          {activeTab === "advisor" && <AIAdvisor store={store} onBack={() => setActiveTab('home')} />}
        </div>
      </div>

      <nav className="bottom-nav">
        <button onClick={() => setActiveTab('home')} className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}>
          <HomeIcon className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('debts')} className={`nav-item ${activeTab === 'debts' ? 'active' : ''}`}>
          <Users className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`}>
          <CreditCard className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('bills')} className={`nav-item ${activeTab === 'bills' ? 'active' : ''}`}>
          <Receipt className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('advisor')} className={`nav-item ${activeTab === 'advisor' ? 'active' : ''}`}>
          <Sparkles className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}
