# AI Challenge 05: Policy Summary Generator

A dynamic, client-side web application that takes complex nested insurance policy JSON data and converts it into a beautifully formatted, print-ready document. 

## Features

- **Dynamic Data Mapping**: Capable of reading deeply nested JSON configurations and dynamically rendering them. (Handles `annual_limit`, `lifetime_limit`, `limit_per_day`, `limit_per_event`, etc., without hardcoding).
- **Policy Switcher**: Includes two vastly different sample policies (`Corporate Health Plus` and `SME Basic Coverage`) to demonstrate the UI's scalable flexibility.
- **Financial Formatting**: Automatically applies appropriate thousand-separators and currency symbols (e.g., THB, VND) utilizing the standard `Intl.NumberFormat` API.
- **Warning Badges**: Automatically detects and highlights Exclusions and Waiting Periods with visually distinct hazard styling.
- **Native Print to PDF**: Instead of relying on brittle backend PDF libraries, this app utilizes heavily optimized `@media print` CSS. By clicking "Print to PDF", the browser automatically strips away UI elements and renders a pixel-perfect A4 document.

## Technology Stack

- **Framework**: Next.js (App Router)
- **UI Library**: React
- **Styling**: Vanilla CSS (`app/globals.css`), featuring `@media print` rules.
- **Typography**: Google Fonts (Outfit)

## How to Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Generating PDFs

To generate a PDF, simply navigate to the application and click the **Print to PDF** button in the sidebar (or press `Cmd+P` / `Ctrl+P`). The application will automatically format itself for standard A4 printing.
