export interface Medicine {
    id?: string;
    generic_name: string;
    brand_names?: string[];
    strength: string;
    form: string;
    unit_price: number;
    current_stock: number;
    min_stock_level: number;
    stock_status?: string;
    is_demo?: boolean;
    shelf_position?: string;
}

export interface StockUpdateLog {
    id: string;
    medicine_name: string;
    pharmacist_name: string;
    quantity_added: number;
    stock_before: number;
    stock_after: number;
    notes?: string;
    created_at: string;
}

export interface AnalyticsTimeSeries {
    date: string;
    sales: number;
    items_sold: number;
}

export interface AnalyticsCategoryDist {
    category: string;
    count: number;
}

export interface AnalyticsData {
    total_sales_month: number;
    total_items_sold_month: number;
    low_stock_count: number;
    active_medicines_count: number;
    sales_over_time: AnalyticsTimeSeries[];
    category_distribution: AnalyticsCategoryDist[];
}

export interface BillItem {
    medicine_id: string;
    generic_name: string;
    strength: string;
    quantity_prescribed: number;
    unit_price: number;
    line_total: number;
    gst_amount: number;
    item_total: number;
    found_in_inventory: boolean;
    stock_available: boolean;
    current_stock: number;
    is_seeded?: boolean;
    frequency?: string;
    duration?: string;
    shelf_position?: string;
}

export interface ClinicalAnalysis {
    inferred_diagnosis?: string;
    patient_advice?: string;
    pharmacist_notes?: string;
}

export interface ScanResponse {
    status: string;
    bill_id: string;
    bill_number: string;
    medicines: BillItem[];
    subtotal: number;
    total_gst: number;
    final_amount: number;
    extraction_confidence: number;
    patient_name?: string;
    patient_age?: string;
    doctor_notes?: string;
    clinical_analysis?: ClinicalAnalysis;
    warnings: any[];
}
