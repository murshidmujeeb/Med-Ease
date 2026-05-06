import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button, Input } from '../ui';
import { Medicine } from '../../types';

interface AddStockModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({ onClose, onSuccess }) => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [search, setSearch] = useState("");
    const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
    const [quantity, setQuantity] = useState("");
    const [shelf, setShelf] = useState("");
    const [pin, setPin] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (search.length < 2) return;
        const fetchMeds = async () => {
             try {
                const apiUrl = import.meta.env.VITE_API_URL || '';
                const response = await axios.get(`${apiUrl}/api/inventory`, {
                    params: { search, is_demo: false }
                });
                setMedicines(response.data.medicines);
            } catch (err) {
                console.error(err);
            }
        };
        const t = setTimeout(fetchMeds, 300);
        return () => clearTimeout(t);
    }, [search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMed || !quantity || !pin) return;

        setIsSubmitting(true);
        setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            await axios.post(`${apiUrl}/api/inventory/stock`, {
                medicine_id: selectedMed.id,
                pharmacist_pin: pin,
                quantity_added: parseInt(quantity),
                shelf_position: shelf,
                notes: notes
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to update stock. Check PIN.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Add Stock Entry</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Inventory Management</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Search Medicine</label>
                        {!selectedMed ? (
                            <div className="relative">
                                <Input 
                                    placeholder="Type generic or brand name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:ring-blue-100 rounded-xl h-12"
                                />
                                {medicines.length > 0 && search.length >= 2 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 max-h-48 overflow-y-auto p-2">
                                        {medicines.map(m => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedMed(m);
                                                    setShelf(m.shelf_position || "");
                                                    setSearch("");
                                                    setMedicines([]);
                                                }}
                                                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors border-b last:border-0 border-slate-50"
                                            >
                                                <div className="font-bold text-sm text-slate-900">{m.generic_name}</div>
                                                <div className="text-[10px] text-slate-400">{m.strength} • Current: {m.current_stock}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {medicines.length === 0 && search.length >= 2 && !isSubmitting && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 p-4 text-center">
                                        <p className="text-xs text-slate-500 font-medium mb-3">No medicine found with this name.</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose(); // Close AddStock modal
                                                // We need a way to open Register Med from here.
                                                // Actually, simpler to just tell user to use the Register button.
                                                // But let's trigger a custom event or a callback if possible.
                                                // For now, I'll add a helper text.
                                            }}
                                            className="text-xs font-black text-blue-600 uppercase tracking-wider hover:underline"
                                        >
                                            Use "Register New Item" in sidebar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                                <div>
                                    <div className="font-black text-blue-900">{selectedMed.generic_name}</div>
                                    <div className="text-[11px] text-blue-700 font-bold">{selectedMed.strength}</div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setSelectedMed(null)}
                                    className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-4"
                                >
                                    Change
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Quantity to Add</label>
                            <Input 
                                type="number"
                                placeholder="e.g. 100"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="bg-slate-50 border-slate-200 rounded-xl h-12 font-mono"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Shelf Position</label>
                            <Input 
                                placeholder="e.g. Rack A-5"
                                value={shelf}
                                onChange={(e) => setShelf(e.target.value)}
                                className="bg-slate-50 border-slate-200 rounded-xl h-12"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Reason / Notes</label>
                        <Input 
                            placeholder="Initial stock, Replenishment, etc."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="bg-slate-50 border-slate-200 rounded-xl h-12"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <Input 
                                type="password"
                                placeholder="Pharmacist PIN to authorize"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="bg-slate-900 text-white placeholder:text-slate-500 border-none rounded-xl h-14 pl-12 text-center tracking-[0.5em] focus:ring-offset-2 focus:ring-slate-900"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button type="button" variant="outline" onClick={onClose} className="h-12 rounded-xl font-bold border-slate-200">
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !selectedMed || !pin}
                                className="h-12 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 transition-all active:scale-95"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Commit Changes"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
