import React from 'react';
import { ScanResponse } from '../types';

interface ProfessionalInvoiceProps {
    billData: ScanResponse;
}

export const ProfessionalInvoice: React.FC<ProfessionalInvoiceProps> = ({ billData }) => {
    const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const GSTIN = "32AAACM7120G1Z2"; // Mocked GSTIN for MedEase

    return (
        <div className="bg-white min-h-[297mm] w-[210mm] mx-auto text-slate-800 font-sans printable-invoice shadow-none relative p-0 border border-slate-100 flex flex-col">
            {/* Minimal Header with Primary Branding */}
            <div className="p-10 flex justify-between items-start border-b-[6px] border-slate-900">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-xl tracking-tighter">ME</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">MedEase</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Pharmacy & Care</p>
                        </div>
                    </div>
                    <div className="space-y-0.5 pt-2">
                        <p className="text-xs font-bold text-slate-600">MedEase Solutions Pvt Ltd</p>
                        <p className="text-xs font-medium text-slate-500">123, Healthcare Plaza, Medical District</p>
                        <p className="text-xs font-medium text-slate-500">Kochi, Kerala, 682001</p>
                        <p className="text-xs font-black text-slate-900 pt-1 flex items-center gap-2">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">GSTIN: {GSTIN}</span>
                        </p>
                    </div>
                </div>

                <div className="text-right space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">TAX INVOICE</h2>
                        <p className="text-sm font-bold text-slate-500">#{billData.bill_number}</p>
                    </div>
                    <div className="flex justify-end gap-10">
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date</p>
                            <p className="text-sm font-bold text-slate-900">{today}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</p>
                            <p className="text-sm font-black text-emerald-600 uppercase">Paid</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-10 flex-1 flex flex-col">
                {/* Patient & Billing Details */}
                <div className="grid grid-cols-2 gap-10 pb-8 border-b border-slate-100">
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-1">Patient Details</h3>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-900">{billData.patient_name || "Walk-in Guest"}</p>
                            <p className="text-sm font-bold text-slate-500 italic">
                                {billData.patient_age ? `Age: ${billData.patient_age} Years` : "Age: Not Specified"}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3 text-right">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-1 inline-block w-40">Contact Information</h3>
                        <p className="text-sm font-medium text-slate-600">medease-care.com</p>
                        <p className="text-sm font-medium text-slate-600">+91 484 2555 7777</p>
                    </div>
                </div>

                {/* Table Section */}
                <div className="mt-8 flex-1">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">#</th>
                                <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">Medicine Description</th>
                                <th className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">HSN</th>
                                <th className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">Qty</th>
                                <th className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">MRP (₹)</th>
                                <th className="py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">GST %</th>
                                <th className="py-3 px-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {billData.medicines.filter(m => m.found_in_inventory).map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="py-4 px-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                                    <td className="py-4 px-4">
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.generic_name}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{item.strength} • {item.duration || "Course"}</p>
                                    </td>
                                    <td className="py-4 px-4 text-center text-xs font-medium text-slate-500">3004</td>
                                    <td className="py-4 px-4 text-center text-sm font-bold text-slate-900">{item.quantity_prescribed}</td>
                                    <td className="py-4 px-4 text-center text-sm font-medium text-slate-600">{item.unit_price.toFixed(2)}</td>
                                    <td className="py-4 px-4 text-center text-xs font-bold text-slate-500">12%</td>
                                    <td className="py-4 px-4 text-right text-sm font-black text-slate-900">
                                        {item.item_total.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="mt-10 border-t-2 border-slate-900 pt-6">
                    <div className="flex justify-between items-end">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Total in words</p>
                                <p className="text-xs font-bold text-slate-700 italic">Rupees {billData.final_amount % 1 === 0 ? billData.final_amount : billData.final_amount.toFixed(2)} only</p>
                            </div>
                            <div className="pt-6">
                                <div className="h-10 w-40 border-b border-slate-300"></div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Authorised Signatory</p>
                            </div>
                        </div>

                        <div className="w-72 bg-slate-50 rounded-xl p-6 border border-slate-100 space-y-3">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-500 uppercase">Subtotal</span>
                                <span className="text-slate-900">₹{billData.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-500 uppercase">Total GST (12%)</span>
                                <span className="text-slate-900">₹{billData.total_gst.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                                <span className="text-sm font-black uppercase tracking-tighter">Grand Total</span>
                                <span className="text-2xl font-black text-slate-900">₹{billData.final_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-16 pt-6 border-t border-slate-50 flex justify-between items-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                    <p>© MedEase Pharmacy - Surgical Precision in Care</p>
                    <p>Computer Generated Invoice No Signature Required</p>
                </div>
            </div>
        </div>
    );
};
