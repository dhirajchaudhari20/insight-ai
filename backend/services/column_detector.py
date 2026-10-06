import pandas as pd
import numpy as np
import re
from typing import Dict, List, Any

def detect_single_column_type(series: pd.Series) -> str:
    """
    Robust value-based column type detection without relying on column name.
    Returns: 'numeric', 'categorical', 'date', or 'text'.
    """
    # Filter non-null and non-empty values
    non_nulls = series.dropna()
    if len(non_nulls) == 0:
        return 'categorical'  # fallback default
    
    # 1. Native numeric check
    if pd.api.types.is_numeric_dtype(series):
        # Even if numeric, if only 2 values (e.g. 0 and 1) or very small distinct set of ints with low count:
        # Check if it acts as boolean/categorical code
        if series.nunique() <= 2 and len(series) > 10:
            return 'categorical'
        return 'numeric'
    
    # 2. Native datetime check
    if pd.api.types.is_datetime64_any_dtype(series):
        return 'date'
    
    # 3. String-based value inspection on a sample (up to 100 rows)
    sample_series = non_nulls.iloc[:120] if len(non_nulls) > 120 else non_nulls
    sample = sample_series.astype(str).str.strip().tolist()
    sample = [s for s in sample if s not in ('', 'nan', 'None', 'null', 'NA', 'N/A')]
    
    if not sample:
        return 'categorical'
    
    sample_size = min(len(sample), 80)
    test_sample = sample[:sample_size]

    # Check for potential numeric strings with formatting (e.g., "$1,250.00", "45%", "-18.5")
    numeric_count = 0
    clean_numeric_regex = re.compile(r'^[\$\€\£\¥]?\s*-?\d+([.,]\d+)?\s*%?$')
    
    for val in test_sample:
        cleaned = val.replace('$', '').replace('€', '').replace('£', '').replace('%', '').replace(',', '').strip()
        try:
            float(cleaned)
            numeric_count += 1
        except ValueError:
            pass
            
    if numeric_count / sample_size >= 0.85:
        return 'numeric'
        
    # Check for date / time strings
    date_count = 0
    for val in test_sample:
        # Fast filter: check if string looks like date (has -, /, :, or year-like 4-digit numbers)
        if re.search(r'[-/:]|\b(19\d\d|20\d\d)\b', val):
            try:
                # Disallow purely numeric short integers mistaken as dates
                if not val.isdigit() or len(val) >= 8:
                    pd.to_datetime(val, errors='raise')
                    date_count += 1
            except Exception:
                pass
                
    if date_count / sample_size >= 0.80:
        return 'date'
        
    # Check cardinality and length to distinguish categorical from free-form text
    unique_count = series.nunique()
    total_count = len(series)
    avg_len = np.mean([len(s) for s in test_sample])
    
    # If average string length is long (> 60 chars), it's likely text
    if avg_len > 60:
        return 'text'
        
    # If distinct values are relatively small or <= 50, it's categorical
    if unique_count <= 50 or (unique_count / total_count < 0.20):
        return 'categorical'
        
    # Otherwise if it has high uniqueness and looks like identifiers/codes or text
    return 'text'


def infer_domain_and_semantics(df: pd.DataFrame, columns_info: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Infers the high-level business domain and semantic roles of columns
    without requiring any user configuration.
    """
    col_names_lower = [str(c['column_name']).lower() for c in columns_info]
    all_col_text = " ".join(col_names_lower)
    
    # Domain keywords scoring
    domain_scores = {
        'Digital Marketing': 0,
        'Healthcare & Clinical': 0,
        'E-Commerce & Retail': 0,
        'SaaS & Subscriptions': 0,
        'Financial & Credit Risk': 0,
        'Human Resources & Talent': 0,
        'Supply Chain & Operations': 0
    }
    
    keywords = {
        'Digital Marketing': ['campaign', 'channel', 'ad_spend', 'spend', 'impression', 'click', 'conversion', 'roas', 'ctr', 'cpc', 'audience', 'lead'],
        'Healthcare & Clinical': ['patient', 'diagnosis', 'department', 'admission', 'length_of_stay', 'stay', 'billing', 'hospital', 'doctor', 'treatment', 'outcome', 'vital'],
        'E-Commerce & Retail': ['order', 'revenue', 'units_sold', 'product', 'category', 'customer', 'discount', 'profit', 'sales', 'cart', 'retail', 'ship', 'rating'],
        'SaaS & Subscriptions': ['churn', 'mrr', 'arr', 'seat', 'subscription', 'tier', 'tenure', 'contract', 'ticket', 'support', 'nps', 'license'],
        'Financial & Credit Risk': ['credit', 'loan', 'income', 'debt', 'interest', 'balance', 'risk', 'default', 'portfolio', 'asset', 'transaction', 'borrower'],
        'Human Resources & Talent': ['employee', 'salary', 'attrition', 'hire', 'department', 'performance', 'payroll', 'role', 'bonus'],
        'Supply Chain & Operations': ['inventory', 'supplier', 'warehouse', 'freight', 'carrier', 'delivery', 'logistics', 'shipment', 'factory']
    }
    
    for domain, kws in keywords.items():
        for kw in kws:
            if kw in all_col_text:
                domain_scores[domain] += 2
            for col in col_names_lower:
                if kw in col:
                    domain_scores[domain] += 1
                    
    sorted_domains = sorted(domain_scores.items(), key=lambda x: x[1], reverse=True)
    best_domain, best_score = sorted_domains[0]
    
    if best_score < 2:
        detected_domain = "Enterprise Operations & Analytics"
        domain_confidence = "Broad"
    else:
        detected_domain = best_domain
        domain_confidence = "High" if best_score >= 4 else "Moderate"

    # Identify semantic roles for each column
    semantic_tags = []
    for col in columns_info:
        name = str(col['column_name']).lower()
        c_type = col['detected_type']
        
        # Determine semantic role
        if c_type == 'date':
            role = 'Date'
        elif any(k in name for k in ['id', 'uuid', 'code', 'key', 'number']) and c_type in ('text', 'numeric', 'categorical'):
            role = 'Identifier'
        elif any(k in name for k in ['revenue', 'sales', 'spend', 'cost', 'billing', 'income', 'profit', 'amount', 'charges', 'balance', 'price']):
            role = 'Monetary'
        elif any(k in name for k in ['units', 'impressions', 'clicks', 'seats', 'tickets', 'visits', 'count', 'stay', 'tenure', 'quantity']):
            role = 'Volume'
        elif any(k in name for k in ['roas', 'rate', 'pct', 'percent', 'ratio', 'score', 'rating', 'ctr', 'margin']):
            role = 'Performance Ratio'
        elif any(k in name for k in ['status', 'churn', 'default', 'outcome', 'stage', 'risk']):
            role = 'Status / Outcome'
        elif c_type == 'categorical':
            role = 'Cohort / Dimension'
        else:
            role = 'Metric' if c_type == 'numeric' else 'Attribute'
            
        col['semantic_role'] = role
        
        # User-facing short label for the detected semantic tags list
        tag_label = col['column_name'].replace('_', ' ').title()
        semantic_tags.append(tag_label)

    return {
        'detected_domain': detected_domain,
        'domain_confidence': domain_confidence,
        'detected_semantic_tags': semantic_tags[:10],
        'domain_description': f"Auto-classified as {detected_domain} ({domain_confidence} confidence) based on underlying feature nomenclature and metric variance."
    }


def detect_all_column_types(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyzes all columns in the DataFrame and produces a detailed schema report
    with automated domain classification and semantic role tagging.
    """
    columns_info: List[Dict[str, Any]] = []
    type_counts = {'numeric': 0, 'categorical': 0, 'date': 0, 'text': 0}
    
    total_rows = len(df)
    
    for col in df.columns:
        series = df[col]
        detected = detect_single_column_type(series)
        type_counts[detected] += 1
        
        missing_count = int(series.isna().sum())
        missing_pct = round((missing_count / total_rows * 100), 2) if total_rows > 0 else 0.0
        unique_cnt = int(series.nunique())
        
        # Sample non-null values for preview
        non_null_samples = series.dropna().astype(str).unique()[:5].tolist()
        
        columns_info.append({
            'column_name': str(col),
            'detected_type': detected,
            'unique_values': unique_cnt,
            'missing_values': missing_count,
            'percentage_missing': missing_pct,
            'sample_values': non_null_samples
        })
        
    domain_info = infer_domain_and_semantics(df, columns_info)
        
    return {
        'columns': columns_info,
        'domain': domain_info,
        'summary': {
            'total_columns': len(df.columns),
            'numeric_columns': type_counts['numeric'],
            'categorical_columns': type_counts['categorical'],
            'date_columns': type_counts['date'],
            'text_columns': type_counts['text'],
            'detected_domain': domain_info['detected_domain'],
            'domain_confidence': domain_info['domain_confidence'],
            'semantic_tags': domain_info['detected_semantic_tags']
        }
    }

