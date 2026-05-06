import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FileText, User, Calendar, Receipt } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

interface BillSummary {
    id: string;
    bill_number: string;
    patient_name: string;
    patient_age: number;
    subtotal: number;
    total_gst: number;
    final_amount: number;
    status: string;
    items_count: number;
    created_at: string;
}

interface PastBillsListProps {
    isDemo: boolean;
}

export const PastBillsList: React.FC<PastBillsListProps> = ({ isDemo }) => {
    const [bills, setBills] = useState<BillSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBills = async () => {
            setLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || '';
                const response = await fetch(`${apiUrl}/api/bills?is_demo=${isDemo}`);
                const data = await response.json();
                setBills(data);
            } catch (error) {
                console.error("Failed to fetch bills:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, [isDemo]);

    if (loading) {
        return <div className="p-20 text-center text-slate-400">Fetching historical records...</div>;
    }

    if (bills.length === 0) {
        return (
            <div className="p-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                    <Receipt className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No transactions found</h3>
                <p className="text-sm text-slate-500 mt-2">Historical bills will appear here once prescriptions are processed.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4 max-w-5xl mx-auto h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Past Billing History</h2>
                    <p className="text-sm text-slate-500">Track and review previous prescriptions and payments.</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-xl text-blue-700 font-bold text-sm">
                    {bills.length} Total Records
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {bills.map((bill) => (
                    <div 
                        key={bill.id} 
                        className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all group cursor-pointer"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                    <FileText className="w-6 h-6 text-slate-400 group-hover:text-white" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-slate-900">{bill.bill_number}</span>
                                        <span className={cn(
                                            "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                                            bill.status === 'CONFIRMED' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                                        )}>
                                            {bill.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {bill.patient_name || 'Anonymous'} ({bill.patient_age}y)
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(bill.created_at), 'MMM dd, yyyy • hh:mm a')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black text-slate-900">{formatCurrency(bill.final_amount)}</div>
                                <div className="text-[10px] font-bold text-slate-400">{bill.items_count} items dispensed</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
