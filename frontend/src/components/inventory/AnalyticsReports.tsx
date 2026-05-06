import React from 'react';
import { AnalyticsData } from '../../types';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { TrendingUp, Package, AlertTriangle, Activity } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

interface AnalyticsProps {
    data: AnalyticsData | null;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AnalyticsReports: React.FC<AnalyticsProps> = ({ data }) => {
    if (!data) return <div className="p-20 text-center text-slate-400">Loading analytics insights...</div>;

    return (
        <div className="p-8 space-y-8 bg-slate-50/20 h-full overflow-y-auto">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Monthly Revenue', value: formatCurrency(data.total_sales_month), sub: '+12% from last month', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Units Dispensed', value: data.total_items_sold_month, sub: 'Confirmed orders', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Low Stock Alerts', value: data.low_stock_count, sub: 'Requires attention', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Active Medicines', value: data.active_medicines_count, sub: 'In catalog', icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2 rounded-lg", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Live</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                        <div className="text-xs font-bold text-slate-500 mt-1">{stat.label}</div>
                        <div className="text-[10px] font-medium text-slate-400 mt-2">{stat.sub}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Sales performance (30 Days)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.sales_over_time}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" hide />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="sales" 
                                    stroke="#0ea5e9" 
                                    strokeWidth={4} 
                                    dot={{stroke: '#0ea5e9', strokeWidth: 2, r: 4, fill: '#fff'}}
                                    activeDot={{r: 6, strokeWidth: 0}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Inventory Distribution</h3>
                    <div className="h-[300px] flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.category_distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="count"
                                    nameKey="category"
                                >
                                    {data.category_distribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            {/* Monthly Report Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Monthly Summarized Report</h3>
                    <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        Export PDF
                    </button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                            <tr>
                                <th className="pb-4 px-2">Metric</th>
                                <th className="pb-4 px-2">Current Period</th>
                                <th className="pb-4 px-2 text-right">Target</th>
                                <th className="pb-4 px-2 text-right">Growth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[
                                { m: 'Total Revenue', v: formatCurrency(data.total_sales_month), t: '₹1,50,000', g: '+18.4%' },
                                { m: 'Items Dispensed', v: data.total_items_sold_month, t: '1,200 units', g: '+5.2%' },
                                { m: 'New Medicines Added', v: data.active_medicines_count, t: '100+', g: '+2 active' },
                                { m: 'Avg. Transaction Value', v: formatCurrency(data.total_sales_month / (data.total_items_sold_month || 1)), t: '₹350', g: '-1.2%' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50">
                                    <td className="py-4 px-2 font-bold text-slate-700">{row.m}</td>
                                    <td className="py-4 px-2 font-mono text-slate-900">{row.v}</td>
                                    <td className="py-4 px-2 text-right text-slate-500 font-mono">{row.t}</td>
                                    <td className="py-4 px-2 text-right text-emerald-600 font-black">{row.g}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};
