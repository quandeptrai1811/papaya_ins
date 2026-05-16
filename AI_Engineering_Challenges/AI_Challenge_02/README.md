# AI Challenge 02: Claims Data Cleanup

This directory contains a complete, dependency-free Python solution for generating and cleaning messy insurance claims data.

## Project Structure

- `generate_data.py`: A script that creates a dataset of 500 messy insurance claims and saves it to the `input/` folder.
- `clean_data.py`: A script that processes the messy dataset, cleans it, and outputs the results to the `output/` folder.
- `input/`: Contains the generated messy dataset (`claims_messy.csv`).
- `output/`: Contains the final cleaned dataset (`claims_clean.csv`) and the statistical report (`report.md`).

## Prerequisites

You only need **Python 3** installed on your system. No external libraries (like `pandas`) are required, as this solution relies entirely on Python's built-in modules (`csv`, `datetime`, `collections`, `random`, `os`).

## Instructions

### 1. Generate the Messy Data (Optional)
If you want to generate a fresh batch of messy data, run the generation script from this directory:

```bash
python3 generate_data.py
```
*This will create or overwrite `input/claims_messy.csv` with exactly 500 rows, inserting intentional data quality issues into approximately 15-20% of the rows.*

### 2. Run the Data Cleanup
To parse, clean, and validate the messy dataset, run the cleaning script:

```bash
python3 clean_data.py
```
*This script will read from `input/claims_messy.csv` and apply strict business rules to normalize text, fix dates, standardize currencies, and drop invalid numerical rows or duplicates.*

### 3. Review the Results
After running the cleanup script, check the `output/` folder:
- **`claims_clean.csv`**: The fully cleaned and standardized dataset.
- **`report.md`**: A detailed markdown report showing the before/after statistics, a breakdown of the specific issues that were fixed, and summary aggregates (e.g., top 5 diagnoses, average amounts by claim type).
