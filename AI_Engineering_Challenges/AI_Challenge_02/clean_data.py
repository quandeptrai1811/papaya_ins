import csv
import os
from datetime import datetime
from collections import Counter, defaultdict

def parse_date(date_str):
    """Attempts to parse a date string using multiple formats."""
    if not date_str:
        return None
    date_str = date_str.strip()
    
    formats_to_try = ["%Y-%m-%d", "%d/%m/%Y", "%B %d, %Y"]
    for fmt in formats_to_try:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

def clean_row(row, issues, diagnoses_counter):
    """
    Cleans a single row of data, tracking issues found.
    Returns (cleaned_row, should_drop, amount).
    """
    drop_row = False
    
    # 1. Missing IDs
    if not row["claim_id"].strip() or not row["policy_id"].strip():
        issues["Missing IDs"] += 1
        
    # 2. Member Name Casing
    orig_name = row["member_name"]
    new_name = orig_name.strip().title()
    if orig_name != new_name:
        issues["Name Casing Fixed"] += 1
    row["member_name"] = new_name
    
    # 3. Claim Type Typos
    orig_type = row["claim_type"].strip().upper()
    new_type = orig_type
    
    if new_type in ["OP", "OUTPATEINT"]:
        new_type = "OUTPATIENT"
    elif new_type in ["IP", "INPATEINT"]:
        new_type = "INPATIENT"
        
    if orig_type != new_type or orig_type != row["claim_type"]:
        issues["Claim Type Typo Fixed"] += 1
    row["claim_type"] = new_type
    
    # 4. Diagnosis Null
    orig_diag = row["diagnosis"].strip()
    if orig_diag.lower() in ["", "n/a"]:
        row["diagnosis"] = "NULL"
        if orig_diag != "NULL":
            issues["Diagnosis Nullified"] += 1
    else:
        row["diagnosis"] = orig_diag
        diagnoses_counter[row["diagnosis"]] += 1
        
    # 5. Invalid Amount
    orig_amt_str = str(row["submitted_amount"]).strip()
    clean_amt_str = orig_amt_str.replace(",", "")
    
    amt = 0.0
    try:
        amt = float(clean_amt_str)
        if amt <= 0:
            issues["Invalid Amounts (Removed)"] += 1
            drop_row = True
    except ValueError:
        issues["Invalid Amounts (Removed)"] += 1
        drop_row = True
        
    row["submitted_amount"] = amt
    
    # 6. Currency
    orig_curr = row["currency"].strip()
    new_curr = orig_curr.upper()
    if new_curr == "BAHT":
        new_curr = "THB"
        
    if orig_curr != new_curr:
        issues["Currency Standardized"] += 1
    row["currency"] = new_curr
    
    # 7. Date formatting
    orig_date = row["submitted_date"]
    parsed_date = parse_date(orig_date)
    if parsed_date:
        row["submitted_date"] = parsed_date
        if parsed_date != orig_date:
            issues["Date Format Fixed"] += 1
            
    # Normalize status string
    row["status"] = row["status"].strip().upper()
    
    return row, drop_row, amt

def process_claims(input_file):
    """Reads the messy CSV, applies cleaning logic, and collects statistics."""
    stats = {
        "total_before": 0,
        "duplicates_removed": 0,
        "issues": Counter(),
        "claims_by_type": Counter(),
        "claims_by_status": Counter(),
        "amount_by_type": defaultdict(list),
        "diagnoses_counter": Counter()
    }
    
    seen_rows = set()
    cleaned_rows = []
    fieldnames = []
    
    with open(input_file, 'r', newline='') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        
        for row in reader:
            stats["total_before"] += 1
            
            # Check for exact duplicate
            row_tuple = tuple(row.items())
            if row_tuple in seen_rows:
                stats["duplicates_removed"] += 1
                continue
            seen_rows.add(row_tuple)
            
            # Clean row
            cleaned_row, should_drop, amt = clean_row(row, stats["issues"], stats["diagnoses_counter"])
            
            if should_drop:
                continue
                
            # Update summary statistics for valid rows
            claim_type = cleaned_row["claim_type"]
            status = cleaned_row["status"]
            
            stats["claims_by_type"][claim_type] += 1
            stats["claims_by_status"][status] += 1
            stats["amount_by_type"][claim_type].append(amt)
            
            cleaned_rows.append(cleaned_row)
            
    stats["total_after"] = len(cleaned_rows)
    return cleaned_rows, fieldnames, stats

def write_clean_csv(output_file, fieldnames, cleaned_rows):
    """Writes the cleaned data to a new CSV file."""
    with open(output_file, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(cleaned_rows)

def write_report(report_file, stats):
    """Generates a markdown report summarizing the cleaning process."""
    with open(report_file, 'w') as f:
        f.write("# Data Quality Report\n\n")
        
        f.write("## Overview\n")
        f.write(f"- **Total rows before cleaning:** {stats['total_before']}\n")
        f.write(f"- **Total rows after cleaning:** {stats['total_after']}\n")
        f.write(f"- **Duplicates removed:** {stats['duplicates_removed']}\n\n")
        
        f.write("## Issues Detected & Fixed\n")
        for issue, count in stats["issues"].items():
            f.write(f"- **{issue}:** {count}\n")
        f.write("\n")
        
        f.write("## Summary Statistics\n")
        
        f.write("### Claims by Type\n")
        for ctype, count in stats["claims_by_type"].items():
            f.write(f"- **{ctype}:** {count}\n")
        f.write("\n")
        
        f.write("### Claims by Status\n")
        for status, count in stats["claims_by_status"].items():
            f.write(f"- **{status}:** {count}\n")
        f.write("\n")
        
        f.write("### Average Amount by Type\n")
        for ctype, amounts in stats["amount_by_type"].items():
            avg = sum(amounts) / len(amounts) if amounts else 0
            f.write(f"- **{ctype}:** {avg:,.2f}\n")
        f.write("\n")
        
        f.write("### Top 5 Most Common Diagnoses\n")
        top_5 = stats["diagnoses_counter"].most_common(5)
        for i, (diag, count) in enumerate(top_5, 1):
            f.write(f"{i}. **{diag}** ({count} claims)\n")

def main():
    input_file = "input/claims_messy.csv"
    output_dir = "output"
    output_csv = f"{output_dir}/claims_clean.csv"
    report_md = f"{output_dir}/report.md"
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("Processing claims data...")
    cleaned_rows, fieldnames, stats = process_claims(input_file)
    
    print("Writing clean CSV...")
    write_clean_csv(output_csv, fieldnames, cleaned_rows)
    
    print("Generating report...")
    write_report(report_md, stats)
    
    print("Data cleaning complete. Check the output/ folder for results.")

if __name__ == "__main__":
    main()
