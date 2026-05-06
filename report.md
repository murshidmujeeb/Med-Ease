# MedEase - Pharmacy Automation System Project Report

## Executive Summary
MedEase is an end-to-end pharmacy workflow automation system designed to streamline the processing of prescriptions, automate billing, and manage inventory in real-time. The unique selling proposition of the application is its integration with Google Gemini Pro Vision to extract medicine details directly from uploaded or camera-captured prescription images.

## Architecture & Tech Stack
The application is structured as a modern decoupled web application with a separate frontend and backend interface.

### Frontend
- **Framework**: React with TypeScript, built using Vite.
- **Styling**: Tailwind CSS for responsive and modern UI components.
- **Routing**: React Router DOM for client-side navigation between Landing Page, Bill Review, and Inventory Dashboard.
- **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`).
- **Icons**: Lucide React.
- **Key Features**:
  - Drag-and-drop prescription upload interface.
  - Integration with the device camera for capturing physical prescriptions.
  - Bill review system where pharmacists can confirm AI-extracted medicine details, check stock availability, and confirm final bills.
  - Inventory dashboard with search and low-stock highlighting.

### Backend
- **Framework**: FastAPI (Python) for high-performance, asynchronous REST APIs.
- **Database ORM**: SQLAlchemy for database interactions, supporting a structured relational data model. 
- **Database Engine**: Supports PostgreSQL (as indicated by the Docker configuration) or SQLite for local development.
- **AI Integration**: Implements a service (`app.services.gemini_service`) to call the Google Gemini API to process images and return structured JSON containing medicine names, strengths, dosages, and confidence scores.
- **Endpoints**:
  - `POST /prescriptions/scan`: Handles file uploads to Gemini, matches returned generic/brand names against the database, and calculates line items with GST.
  - `POST /bills/{bill_id}/confirm`: Handles PIN-based authentication for pharmacists, finalizes bills, deducts inventory, and logs transactions.
  - `GET /inventory`: Provides real-time stock levels with low-stock filtering.

## Core Workflows

1. **Prescription Ingestion**: A user (pharmacist) uploads an image or takes a photo. The image is sent to the FastAPI backend, where the Gemini Vision model parses the handwritten or printed text into structured data.
2. **Data Matching & Pricing**: The backend matches the extracted medicine names against the local inventory database. It automatically retrieves unit prices, calculates GST, and flags medicines that are out of stock or not found in the inventory.
3. **Review & Confirmation**: The pharmacist reviews the pending bill on the UI, enters their secure PIN to authenticate, and confirms the transaction.
4. **Inventory Deduction & Auditing**: Upon confirmation, the system creates an `InventoryTransaction` to deduct the dispensed quantity from the `current_stock` and records an `AuditLog` for security and compliance.

## Environment & Deployment Setup
- The repository includes a `docker-compose.yml` for containerized deployment, which builds both the frontend and backend services along with a PostgreSQL database.
- For local development without Docker, the backend can be run via `uvicorn app.main:app --reload` within the `.venv` directory, and the frontend via `npm run dev`.
- **Environment Variables**: The system strictly depends on `GOOGLE_API_KEY` for the AI extraction to function.

## Conclusion
MedEase effectively leverages cutting-edge LLM vision capabilities to solve traditional pharmacy bottlenecks. Its architecture is robust and modular, paving the way for further enhancements such as direct payment gateway integration, advanced analytics reporting, and cloud deployment on platforms like Render (evidenced by the `render.yaml` file).
