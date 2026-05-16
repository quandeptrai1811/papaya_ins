import csv
import random
from datetime import datetime, timedelta

def generate_data():
    num_rows = 500
    rows = []
    
    first_names = ["John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Heidi"]
    last_names = ["Doe", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez"]
    diagnoses = ["Flu", "COVID-19", "Fracture", "Migraine", "Sprain", "Checkup", "Dental Caries", "Asthma", "Diabetes", "Hypertension"]
    valid_claim_types = ["OUTPATIENT", "INPATIENT", "DENTAL", "MATERNITY"]
    valid_statuses = ["APPROVED", "REJECTED", "PENDING", "IN_REVIEW"]
    
    # Generate valid rows first
    for i in range(num_rows):
        claim_id = f"CLM-{1000 + i}"
        policy_id = f"POL-{100 + random.randint(1, 900)}"
        member_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        claim_type = random.choice(valid_claim_types)
        diagnosis = random.choice(diagnoses)
        submitted_amount = random.randint(1000, 50000)
        currency = random.choice(["THB", "VND"])
        
        # Random date in 2024
        start_date = datetime(2024, 1, 1)
        random_days = random.randint(0, 360)
        submitted_date = (start_date + timedelta(days=random_days)).strftime("%Y-%m-%d")
        
        status = random.choice(valid_statuses)
        
        row = {
            "claim_id": claim_id,
            "policy_id": policy_id,
            "member_name": member_name,
            "claim_type": claim_type,
            "diagnosis": diagnosis,
            "submitted_amount": submitted_amount,
            "currency": currency,
            "submitted_date": submitted_date,
            "status": status
        }
        rows.append(row)
        
    # Introduce issues into ~18% of rows (90 rows)
    num_issues = 90
    indices_with_issues = random.sample(range(num_rows), num_issues)
    
    # We will also create some exact duplicates
    num_duplicates = 10
    duplicate_rows = []
    
    for idx in indices_with_issues:
        issue_type = random.randint(1, 8)
        row = rows[idx]
        
        if issue_type == 1:
            # Missing ID
            if random.choice([True, False]):
                row["claim_id"] = ""
            else:
                row["policy_id"] = ""
                
        elif issue_type == 2:
            # Casing issue in name
            if random.choice([True, False]):
                row["member_name"] = row["member_name"].upper()
            else:
                row["member_name"] = row["member_name"].lower()
                
        elif issue_type == 3:
            # Claim type typo
            if row["claim_type"] == "OUTPATIENT":
                row["claim_type"] = random.choice(["outpatient", "Outpateint", "OP"])
            elif row["claim_type"] == "INPATIENT":
                row["claim_type"] = random.choice(["inpatient", "IP", "Inpateint"])
            else:
                row["claim_type"] = row["claim_type"].lower()
                
        elif issue_type == 4:
            # Diagnosis empty/NA
            row["diagnosis"] = random.choice(["", "N/A", "n/a", " "])
            
        elif issue_type == 5:
            # Invalid amount (negative, zero, or string with comma)
            amt_issue = random.randint(1, 3)
            if amt_issue == 1:
                row["submitted_amount"] = -1 * row["submitted_amount"]
            elif amt_issue == 2:
                row["submitted_amount"] = 0
            else:
                row["submitted_amount"] = f"{row['submitted_amount']:,}"
                
        elif issue_type == 6:
            # Currency mixup
            if row["currency"] == "THB":
                row["currency"] = random.choice(["thb", "Baht"])
            else:
                row["currency"] = random.choice(["vnd", "Vnd"])
                
        elif issue_type == 7:
            # Date format mixup
            date_obj = datetime.strptime(row["submitted_date"], "%Y-%m-%d")
            if random.choice([True, False]):
                # DD/MM/YYYY
                row["submitted_date"] = date_obj.strftime("%d/%m/%Y")
            else:
                # Month DD, YYYY
                row["submitted_date"] = date_obj.strftime("%B %d, %Y")
        
        elif issue_type == 8:
            # Multiple issues
            row["currency"] = row["currency"].lower()
            row["diagnosis"] = "n/a"
            row["submitted_amount"] = f"{random.randint(1000,50000):,}"

    # Pick 10 random rows to duplicate
    duplicate_indices = random.sample(range(num_rows), num_duplicates)
    for idx in duplicate_indices:
        duplicate_rows.append(rows[idx].copy())
        
    # Add duplicates to the end
    rows.extend(duplicate_rows)
    
    # Shuffle slightly so duplicates are mixed in (optional, but realistic)
    random.shuffle(rows)
    
    # Make sure we exactly have 500 rows? The prompt says "a messy CSV of 500 insurance claims".
    # If we appended 10, we have 510. Let's slice to exactly 500, or just let it be 500 by replacing instead of extending.
    # To be exactly 500, we should generate 490 unique, and 10 duplicates.
    # Let's just output the first 500 rows after shuffle.
    rows = rows[:500]

    fieldnames = ["claim_id", "policy_id", "member_name", "claim_type", "diagnosis", "submitted_amount", "currency", "submitted_date", "status"]
    import os
    os.makedirs('input', exist_ok=True)
    
    with open('input/claims_messy.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Successfully generated input/claims_messy.csv with {len(rows)} rows.")

if __name__ == "__main__":
    generate_data()
