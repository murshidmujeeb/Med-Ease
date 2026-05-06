import React from 'react';
import { Medicine } from '../../types';
import { Search, MapPin } from 'lucide-react';
import { Input } from '../ui';
import { cn } from '../../lib/utils';

interface InventoryTableProps {
    medicines: Medicine[];
    loading: boolean;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ medicines, loading }) => {
    const [search, setSearch] = React.useState("");

    const filtered = medicines.filter(m => 
        m.generic_name.toLowerCase().includes(search.toLowerCase()) ||
        m.brand_names?.some(b => b.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Filter medicines by name or brand..."
                        className="pl-9 bg-white border-slate-200 focus:ring-2 focus:ring-blue-100"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {filtered.length} Medicines Found
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-white text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Medicine Details</th>
                            <th className="px-6 py-4">Shelf Position</th>
                            <th className="px-6 py-4 text-right">Unit Price</th>
                            <th className="px-6 py-4 text-center">Stock Level</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-20 text-slate-400">Loading inventory data...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-20 text-slate-400">No medicines match your search.</td></tr>
                        ) : filtered.map((med) => (
                            <tr key={med.id} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{med.generic_name}</div>
                                    <div className="text-[11px] text-slate-400 font-medium">
                                        {med.strength} • {med.brand_names?.join(", ")}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-slate-600 font-medium bg-slate-100/50 w-fit px-2 py-1 rounded-md border border-slate-200/50">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                        {med.shelf_position || "Not Assigned"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-slate-900 font-semibold">
                                    ₹{med.unit_price.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="font-mono text-lg font-bold text-slate-900">{med.current_stock}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Units</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight shadow-sm",
                                        med.stock_status === 'LOW'
                                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    )}>
                                        {med.stock_status === 'LOW' ? 'Low Stock' : 'Optimized'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
