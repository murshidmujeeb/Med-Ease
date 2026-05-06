import React from 'react';
import { StockUpdateLog } from '../../types';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, User } from 'lucide-react';

interface StockHistoryProps {
    logs: StockUpdateLog[];
}

export const StockHistoryDashboard: React.FC<StockHistoryProps> = ({ logs }) => {
    return (
        <div className="flex flex-col h-full bg-slate-50/30">
            <div className="p-6 border-b border-slate-100 bg-white">
                <h3 className="text-lg font-bold text-slate-900">Recent Inventory activity</h3>
                <p className="text-sm text-slate-500">History of manual stock updates and inventory changes.</p>
            </div>

            <div className="p-6">
                {logs.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                        No activity records found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div key={log.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`${log.quantity_added < 0 ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'} p-3 rounded-xl border`}>
                                            {log.quantity_added < 0 ? (
                                                <ArrowDownRight className="w-5 h-5 text-red-600" />
                                            ) : (
                                                <ArrowUpRight className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{log.medicine_name}</p>
                                            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                <User className="w-3.5 h-3.5" />
                                                Updated by <span className="font-semibold text-slate-700">{log.pharmacist_name}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-900">
                                            {format(new Date(log.created_at), 'MMM dd, yyyy • HH:mm')}
                                        </div>
                                        <div className="text-[11px] text-slate-400 uppercase font-black mt-1">
                                            Timestamp
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-5 grid grid-cols-3 gap-4 border-t border-slate-50 pt-5">
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Stock Change</div>
                                        <div className={`text-lg font-mono font-black ${log.quantity_added < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {log.quantity_added > 0 ? '+' : ''}{log.quantity_added}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Previous Stock</div>
                                        <div className="text-lg font-mono font-black text-slate-700">{log.stock_before}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Current Stock</div>
                                        <div className="text-lg font-mono font-black text-slate-900">{log.stock_after}</div>
                                    </div>
                                </div>

                                {log.notes && (
                                    <div className="mt-4 bg-slate-50 p-3 rounded-lg text-sm text-slate-600 italic border border-slate-100">
                                        "{log.notes}"
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
