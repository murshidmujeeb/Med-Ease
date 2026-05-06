import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Database, Activity, Pill } from 'lucide-react';
import { Button } from '../components/ui';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Navbar */}
            <nav className="p-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
                            <Pill className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">MedEase</span>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => navigate('/inventory')} className="text-slate-600 hover:text-slate-900">Inventory</Button>
                        <Button onClick={() => navigate('/billing')} className="bg-slate-900 hover:bg-slate-800 text-white">Login to System</Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6 border border-blue-100">
                                <Zap className="w-4 h-4 mr-2 fill-blue-700" /> AI-Powered Pharmacy Management
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight">
                                Pharmacy Automation <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Reimagined.</span>
                            </h1>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
                                Stop typing prescriptions manually.
                                Our advanced vision system extracts medicines in seconds, manages your inventory, and secures your billing.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => navigate('/billing')}
                                    className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 rounded-xl transition-all hover:scale-105"
                                >
                                    Billing <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-14 px-8 text-lg bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                                    onClick={() => navigate('/inventory')}
                                >
                                    View Inventory
                                </Button>
                            </div>

                            <div className="mt-12 flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                                    ))}
                                </div>
                                <p>Trusted by modern pharmacies</p>
                            </div>
                        </div>

                        {/* Hero Image / Graphic */}
                        <div className="relative hidden lg:block">
                            <div className="absolute inset-0 bg-blue-100 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
                            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="space-y-4">
                                    <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
                                    <div className="h-32 bg-slate-50 rounded border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                                        Prescription Preview
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-full bg-slate-100 rounded"></div>
                                        <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                        <div className="h-8 w-24 bg-blue-100 rounded"></div>
                                        <div className="h-8 w-8 bg-green-100 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mt-32">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
                                <Activity className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Precision Extraction</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Our engine identifies medicine names, dosages, and quantities with 99% accuracy, even from handwritten notes.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
                                <Database className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Live Inventory</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Stocks are updated instantly as you bill. Get alerts for low stock and expiring batches automatically.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6">
                                <Shield className="h-6 w-6 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Enterprise Security</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Role-based access (Admin/Staff), PIN verification for dispensing, and complete audit trails.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 py-12 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <div className="mb-4 md:mb-0">
                        <span className="font-bold text-slate-900 text-lg">MedEase</span>
                        <p className="mt-1">Pharmacy Automation Suite</p>
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-slate-900">Privacy</a>
                        <a href="#" className="hover:text-slate-900">Terms</a>
                        <a href="#" className="hover:text-slate-900">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
