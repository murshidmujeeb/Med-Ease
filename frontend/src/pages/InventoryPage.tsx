import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, BarChart3, Database } from 'lucide-react';
import { Card, CardContent } from '../components/ui';
import { Medicine, StockUpdateLog, AnalyticsData } from '../types';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { StockHistoryDashboard } from '../components/inventory/StockHistoryDashboard';
import { AnalyticsReports } from '../components/inventory/AnalyticsReports';
import { PastBillsList } from '../components/inventory/PastBillsList';
import { AddStockModal } from '../components/inventory/AddStockModal';
import { RegisterMedicineModal } from '../components/inventory/RegisterMedicineModal';
import { cn } from '../lib/utils';
import { Receipt } from 'lucide-react';

interface InventoryPageProps {
    isDemoMode: boolean;
    setIsDemoMode: (val: boolean) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ isDemoMode, setIsDemoMode }) => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'history' | 'analytics' | 'bills'>('inventory');
    // const [isDemoMode, setIsDemoMode] = useState(true); // Moved to App.tsx
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [logs, setLogs] = useState<StockUpdateLog[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [showAddStock, setShowAddStock] = useState(false);
    const [showRegisterMed, setShowRegisterMed] = useState(false);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await axios.get(`${apiUrl}/api/inventory`, {
                params: { is_demo: isDemoMode }
            });
            setMedicines(response.data.medicines);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await axios.get(`${apiUrl}/api/inventory/logs`);
            setLogs(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await axios.get(`${apiUrl}/api/inventory/analytics`, {
                params: { is_demo: isDemoMode }
            });
            setAnalytics(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchInventory();
        if (activeTab === 'history') fetchLogs();
        if (activeTab === 'analytics') fetchAnalytics();
    }, [isDemoMode, activeTab]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pharmacy Inventory</h1>
                    <p className="text-slate-500 mt-1">Manage stock, view history, and analyze performance.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <button
                        onClick={() => setIsDemoMode(true)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            isDemoMode ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        Demo Preview
                    </button>
                    <button
                        onClick={() => setIsDemoMode(false)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            !isDemoMode ? "bg-green-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        Live Inventory
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                            activeTab === 'inventory' ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-600 hover:bg-white/50"
                        )}
                    >
                        <Database className="w-5 h-5" />
                        Inventory Stock
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                            activeTab === 'history' ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-600 hover:bg-white/50"
                        )}
                    >
                        <History className="w-5 h-5" />
                        Stock History
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                            activeTab === 'analytics' ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-600 hover:bg-white/50"
                        )}
                    >
                        <BarChart3 className="w-5 h-5" />
                        Analytics & Reports
                    </button>
                    <button
                        onClick={() => setActiveTab('bills')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                            activeTab === 'bills' ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-600 hover:bg-white/50"
                        )}
                    >
                        <Receipt className="w-5 h-5" />
                        Past Bills
                    </button>

                    {!isDemoMode && (
                        <div className="mt-8 pt-8 border-t border-slate-200">
                            <button
                                onClick={() => setShowAddStock(true)}
                                className="w-full bg-slate-900 text-white hover:bg-slate-800 px-4 py-3 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95"
                            >
                                + Add Stock Entry
                            </button>
                            <button
                                onClick={() => setShowRegisterMed(true)}
                                className="w-full mt-3 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Database className="w-4 h-4 text-blue-600" />
                                Register New Item
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <Card className="min-h-[600px] border-slate-200 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            {activeTab === 'inventory' && (
                                <InventoryTable medicines={medicines} loading={loading} />
                            )}
                            {activeTab === 'history' && (
                                <StockHistoryDashboard logs={logs} />
                            )}
                            {activeTab === 'analytics' && (
                                <AnalyticsReports data={analytics} />
                            )}
                            {activeTab === 'bills' && (
                                <PastBillsList isDemo={isDemoMode} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {showAddStock && (
                <AddStockModal 
                    onClose={() => setShowAddStock(false)} 
                    onSuccess={() => {
                        setShowAddStock(false);
                        fetchInventory();
                    }}
                />
            )}

            {showRegisterMed && (
                <RegisterMedicineModal
                    onClose={() => setShowRegisterMed(false)}
                    onSuccess={() => {
                        setShowRegisterMed(false);
                        fetchInventory();
                    }}
                />
            )}
        </div>
    );
};
