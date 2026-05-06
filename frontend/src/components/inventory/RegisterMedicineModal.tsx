import React, { useState } from 'react';
import axios from 'axios';
import { X, Loader2, AlertCircle, ShieldCheck, Plus } from 'lucide-react';
import { Button, Input } from '../ui';

interface RegisterMedicineModalProps {
    onClose: () => void;
    onSuccess: (medicineId: string) => void;
}

export const RegisterMedicineModal: React.FC<RegisterMedicineModalProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        generic_name: "",
        brand_names_str: "",
        strength: "",
        form: "",
        unit_price: "",
        gst_rate: "5",
        min_stock_level: "10",
        shelf_position: "",
        initial_stock: "0"
    });
    const [pin, setPin] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pin) {
            setError("Pharmacist PIN is required for registration");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const brand_names = formData.brand_names_str.split(',').map(s => s.trim()).filter(s => s);
            
            const response = await axios.post(`${apiUrl}/api/inventory/register`, {
                generic_name: formData.generic_name,
                brand_names,
                strength: formData.strength,
                form: formData.form,
                unit_price: parseFloat(formData.unit_price),
                gst_rate: parseFloat(formData.gst_rate),
                min_stock_level: parseInt(formData.min_stock_level),
                shelf_position: formData.shelf_position,
                initial_stock: parseInt(formData.initial_stock),
                pharmacist_pin: pin
            });
            
            onSuccess(response.data.medicine_id);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to register medicine. Check PIN or duplication.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Register New Medicine</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Live Inventory Catalog</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Generic Name *</label>
                            <Input 
                                name="generic_name"
                                value={formData.generic_name}
                                onChange={handleInputChange}
                                placeholder="e.g. Paracetamol"
                                className="bg-slate-50 border-slate-200 rounded-xl h-11"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Brand Names (comma separated)</label>
                            <Input 
                                name="brand_names_str"
                                value={formData.brand_names_str}
                                onChange={handleInputChange}
                                placeholder="e.g. Crocin, Dolo"
                                className="bg-slate-50 border-slate-200 rounded-xl h-11"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Strength *</label>
                            <Input 
                                name="strength"
                                value={formData.strength}
                                onChange={handleInputChange}
                                placeholder="e.g. 500mg"
                                className="bg-slate-50 border-slate-200 rounded-xl h-11"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Form *</label>
                            <Input 
                                name="form"
                                value={formData.form}
                                onChange={handleInputChange}
                                placeholder="e.g. Tablet"
                                className="bg-slate-50 border-slate-200 rounded-xl h-11"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Unit Price ($) *</label>
                            <Input 
                                name="unit_price"
                                type="number"
                                step="0.01"
                                value={formData.unit_price}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="bg-slate-50 border-slate-200 rounded-xl h-11 font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">GST Rate (%)</label>
                            <select 
                                name="gst_rate"
                                value={formData.gst_rate}
                                onChange={handleInputChange as any}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 px-3 text-sm font-semibold focus:ring-2 focus:ring-blue-100 outline-none"
                            >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Initial Stock</label>
                            <Input 
                                name="initial_stock"
                                type="number"
                                value={formData.initial_stock}
                                onChange={handleInputChange}
                                className="bg-slate-50 border-slate-200 rounded-xl h-11 font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Shelf Position</label>
                            <Input 
                                name="shelf_position"
                                value={formData.shelf_position}
                                onChange={handleInputChange}
                                placeholder="e.g. A-12"
                                className="bg-slate-50 border-slate-200 rounded-xl h-11"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <Input 
                                type="password"
                                placeholder="Enter Pharmacist PIN to Register"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="bg-slate-900 text-white placeholder:text-slate-500 border-none rounded-xl h-14 pl-12 text-center tracking-[0.5em] focus:ring-offset-2 focus:ring-slate-900"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button type="button" variant="outline" onClick={onClose} className="h-12 rounded-xl font-bold border-slate-200 hover:bg-slate-50">
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !pin}
                                className="h-12 rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        <span>Register Medicine</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
