# Alsahel CMS

Professional React Dashboard for Alsahel CMS.

## Tech Stack

- **React** (Vite)
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Chart.js** for visualization
- **Lucide React** for icons
- **React Hook Form** for form handling

## Features

- **Authentication**: Secure login (Mock: admin/admin).
- **Dashboard**: KPI Cards and interactive Charts.
- **Gestion Élevage**: Complete CRUD management for rationnement sheets.
  - Creating, Reading, Updating, Deleting records.
  - Sorting, Filtering, Pagination.
- **Production**: Placeholder module for future expansion.
- **Responsive Design**: Mobile-friendly layout.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:5173`

## Login Credentials

- **Username**: `admin`
- **Password**: `admin` (or any password >= 4 chars)

## Project Structure

- `src/components`: Reusable UI and Layout components.
- `src/pages`: Application views (Login, Dashboard, Elevage).
- `src/services`: Mock API services (ElevageService).
- `src/context`: React Context for global state (Auth).
- `src/utils`: Helper functions and configuration.
