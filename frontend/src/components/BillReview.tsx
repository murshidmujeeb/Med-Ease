import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, Printer, Loader2, MapPin, Download } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from './ui';
import { ScanResponse } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { ProfessionalInvoice } from './ProfessionalInvoice';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface BillReviewProps {
    billData: ScanResponse;
    onReset: () => void;
    isDemo?: boolean;
}

export const BillReview: React.FC<BillReviewProps> = ({ billData, onReset, isDemo = false }) => {
    const [pin, setPin] = useState("");
    const [patientName, setPatientName] = useState(billData.patient_name || "");
    const [patientAge, setPatientAge] = useState(billData.patient_age || "");
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const invoiceRef = React.useRef<HTMLDivElement>(null);

    // Create a local copy of billData with updated patient info for the invoice
    const updatedBillData = {
        ...billData,
        patient_name: patientName,
        patient_age: patientAge
    };

    const handleDownloadPDF = () => {
        const element = invoiceRef.current;
        if (!element) return;

        const opt = {
            margin:       0,
            filename:     `MedEase_Bill_${billData.bill_number || 'export'}.pdf`,
            image:        { type: 'jpeg' as const, quality: 0.98 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                letterRendering: true,
                allowTaint: true
            },
            jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };

        // Capture the PDF with defensive call for potential ESM issues
        const exporter = (html2pdf as any).default || html2pdf;
        if (typeof exporter === 'function') {
            exporter().set(opt).from(element).save();
        } else {
            console.error("html2pdf is not a function", exporter);
        }
    };

    const handleConfirm = async () => {
        setIsConfirming(true);
        setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            await axios.post(`${apiUrl}/api/bills/${billData.bill_id}/confirm`, {
                pharmacist_pin: pin,
                patient_name: patientName,
                patient_age: patientAge
            }, {
                params: { is_demo: isDemo }
            });
            setConfirmed(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Confirmation failed");
        } finally {
            setIsConfirming(false);
        }
    };

    // We no longer return early here to ensure the hidden invoice and other elements are always in the DOM
    // This is critical for handleDownloadPDF and window.print()

    return (
        <div className="max-w-4xl mx-auto mt-6 p-4 print:p-0 print:m-0 print:max-w-none">
            {confirmed ? (
                <div className="max-w-2xl mx-auto mt-10 text-center print:hidden">
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-6">
                            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-green-800 mb-2">Transaction Complete</h2>
                            <p className="text-green-700 mb-6">Bill confirmed and inventory updated.</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDownloadPDF();
                                    }} 
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transform active:scale-95 transition-all"
                                >
                                    <Download className="w-4 h-4 mr-2" /> Download PDF
                                </Button>
                                <Button onClick={() => window.print()} variant="outline" className="bg-white border-slate-300 shadow-sm hover:bg-slate-50">
                                    <Printer className="w-4 h-4 mr-2" /> Print Invoice
                                </Button>
                                <Button onClick={onReset} variant="outline" className="border-slate-300">
                                    Process Next Bill
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="print:hidden no-print">
                    <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Billing</h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Invoice #{billData.bill_number}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium">Confidence Score</p>
                        <span className={cn(
                            "inline-block px-2 py-1 rounded text-sm font-bold",
                            billData.extraction_confidence > 0.8 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        )}>
                            {(billData.extraction_confidence * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-4">
                        {/* Clinical Analysis Card */}
                        {billData.clinical_analysis && (
                            <Card className="bg-blue-50 border-blue-200">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-blue-900 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        Clinical Review
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {billData.clinical_analysis.inferred_diagnosis && (
                                        <div>
                                            <h4 className="font-semibold text-blue-900 text-sm">Potential Diagnosis</h4>
                                            <p className="text-blue-800 text-sm">{billData.clinical_analysis.inferred_diagnosis}</p>
                                        </div>
                                    )}
                                    {billData.clinical_analysis.patient_advice && (
                                        <div>
                                            <h4 className="font-semibold text-blue-900 text-sm">Patient Advice</h4>
                                            <p className="text-blue-800 text-sm">{billData.clinical_analysis.patient_advice}</p>
                                        </div>
                                    )}
                                    {billData.clinical_analysis.pharmacist_notes && (
                                        <div className="bg-white p-3 rounded border border-blue-100 mt-2">
                                            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wide mb-1">Pharmacist Alert</h4>
                                            <p className="text-slate-700 text-sm">{billData.clinical_analysis.pharmacist_notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Medicines</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {billData.medicines.map((item, idx) => (
                                        <div key={idx} className={cn(
                                            "flex justify-between items-start p-3 rounded border",
                                            !item.found_in_inventory ? "bg-red-50/50 border-red-100 opacity-75" :
                                                !item.stock_available ? "bg-yellow-50 border-yellow-200" : "bg-white border-slate-100"
                                        )}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900">{item.generic_name} {item.strength}</p>
                                                    {!item.found_in_inventory ? (
                                                        <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Excluded</span>
                                                    ) : item.is_seeded ? (
                                                        <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide border border-purple-200">Auto-Seeded</span>
                                                    ) : (
                                                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide border border-emerald-200">In Catalog</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5 font-medium">{item.frequency || "No frequency"} • {item.duration || "No duration"}</p>
                                                
                                                {!item.found_in_inventory ? (
                                                    <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1 italic">
                                                        <AlertCircle className="w-3 h-3" /> This item is not in your inventory and will not be billed.
                                                    </p>
                                                ) : (
                                                    <>
                                                        {!item.stock_available && (
                                                            <p className="text-[10px] text-orange-600 font-bold mt-1">⚠️ Low Stock (Remaining: {item.current_stock})</p>
                                                        )}
                                                        {item.shelf_position && (
                                                            <div className="flex items-center gap-1 mt-2 bg-slate-100 w-fit px-1.5 py-0.5 rounded text-[10px] font-black text-slate-600 uppercase border border-slate-200">
                                                                <MapPin className="w-3 h-3" />
                                                                Location: {item.shelf_position}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className={cn(
                                                    "font-black text-base",
                                                    !item.found_in_inventory ? "text-slate-300 line-through" : "text-slate-900"
                                                )}>
                                                    {formatCurrency(item.line_total || 0)}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                    {item.quantity_prescribed} units
                                                    {item.found_in_inventory && ` × ${formatCurrency(item.unit_price || 0)}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span>{formatCurrency(billData.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">GST (Total)</span>
                                    <span>{formatCurrency(billData.total_gst)}</span>
                                </div>
                                <div className="border-t border-slate-200 my-2 pt-2 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatCurrency(billData.final_amount)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Patient & Authorization</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {error && (
                                    <div className="p-2 bg-red-50 text-red-600 text-sm rounded flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        {error}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Patient Name</label>
                                        <Input
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            placeholder="Guest"
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Age</label>
                                        <Input
                                            value={patientAge}
                                            onChange={(e) => setPatientAge(e.target.value)}
                                            placeholder="N/A"
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pharmacist PIN</label>
                                    <Input
                                        type="password"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        placeholder="PIN"
                                        className="text-center tracking-widest h-9"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Button variant="outline" onClick={onReset} className="h-10">Reject</Button>
                                    <Button
                                        onClick={handleConfirm}
                                        disabled={!pin || isConfirming}
                                        className="bg-blue-600 hover:bg-blue-700 h-10 shadow-blue-100 shadow-md"
                                    >
                                        {isConfirming ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirm Bill"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            )}

            {/* Professional Hidden Invoice for Printing and PDF Export */}
            <div className="relative print-container">
                <div 
                    ref={invoiceRef} 
                    className="absolute left-[-9999px] top-[-9999px] print:static print:left-0 print:top-0 print:w-full print:h-full"
                    aria-hidden="true"
                >
                    <ProfessionalInvoice billData={updatedBillData} />
                </div>
            </div>
        </div>
    );
};
