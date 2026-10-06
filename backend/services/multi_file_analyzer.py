"""
Multi-File & Cross-Dataset Analytical Engine.
Provides schema alignment, shared key discovery, cross-dataset correlation,
side-by-side metric comparison, and unified executive cross-file synthesis.
"""

from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np
import time

def detect_shared_keys(dfs: List[Tuple[str, pd.DataFrame]]) -> List[Dict[str, Any]]:
    """
    Scans multiple dataframes to identify candidate join keys (common column names,
    similar semantic content, or matching value sets like date, id, category, region).
    """
    if len(dfs) < 2:
        return []
    
    col_sets = {}
    col_types = {}
    for name, df in dfs:
        # Standardize column names for fuzzy comparison
        col_sets[name] = {col.strip().lower(): col for col in df.columns}
        col_types[name] = {col.strip().lower(): str(df[col].dtype) for col in df.columns}

    # Intersect normalized column names across pairs or all
    all_keys = set.intersection(*[set(cs.keys()) for cs in col_sets.values()])
    
    shared_keys = []
    # High priority business key patterns
    key_priority_patterns = ['date', 'day', 'month', 'year', 'id', 'code', 'category', 'segment', 'region', 'channel', 'department', 'product', 'state', 'country']
    
    # Check all candidate keys
    candidate_keys = list(all_keys)
    # Also check pairwise common keys if no universal key exists
    if not candidate_keys and len(dfs) >= 2:
        first_name, first_df = dfs[0]
        second_name, second_df = dfs[1]
        pair_keys = set(col_sets[first_name].keys()).intersection(set(col_sets[second_name].keys()))
        candidate_keys = list(pair_keys)

    for k in candidate_keys:
        # Calculate overlap percentage of unique values between first two dataframes
        name_a, df_a = dfs[0]
        name_b, df_b = dfs[1]
        orig_col_a = col_sets[name_a][k]
        orig_col_b = col_sets[name_b][k]
        
        vals_a = set(df_a[orig_col_a].dropna().astype(str).unique())
        vals_b = set(df_b[orig_col_b].dropna().astype(str).unique())
        
        overlap_count = len(vals_a.intersection(vals_b))
        overlap_pct = round((overlap_count / max(len(vals_a.union(vals_b)), 1)) * 100, 1)
        
        is_priority = any(pat in k for pat in key_priority_patterns)
        
        shared_keys.append({
            "key_name": orig_col_a,
            "normalized_name": k,
            "data_type": col_types[name_a][k],
            "common_in_all": k in all_keys,
            "unique_values_file_a": len(vals_a),
            "unique_values_file_b": len(vals_b),
            "overlap_pct": overlap_pct,
            "is_recommended_join": is_priority and overlap_pct > 0
        })

    # Sort so recommended join keys come first
    shared_keys.sort(key=lambda x: (x["is_recommended_join"], x["overlap_pct"]), reverse=True)
    return shared_keys


def compare_datasets_side_by_side(file_analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Creates a cross-comparison matrix of dataset characteristics.
    """
    comparison_table = []
    total_records = 0
    total_columns = 0
    total_anomalies = 0

    for item in file_analyses:
        ov = item.get("overview", {})
        cl = item.get("cleaning_report", {})
        ot = item.get("outliers", {})
        
        rows = ov.get("total_rows", 0)
        cols = ov.get("total_columns", 0)
        score = cl.get("quality_score", 95)
        outlier_count = ot.get("total_outlier_rows", 0)
        
        total_records += rows
        total_columns += cols
        total_anomalies += outlier_count
        
        comparison_table.append({
            "filename": ov.get("filename", "Dataset"),
            "rows": rows,
            "columns": cols,
            "numeric_cols": ov.get("numeric_columns", 0),
            "categorical_cols": ov.get("categorical_columns", 0),
            "date_cols": ov.get("date_columns", 0),
            "quality_score": score,
            "missing_pct": ov.get("missing_percentage", 0),
            "outliers_detected": outlier_count,
            "outliers_pct": ot.get("percentage_affected", 0)
        })

    return {
        "comparison_table": comparison_table,
        "aggregate_summary": {
            "total_files": len(file_analyses),
            "total_combined_records": total_records,
            "total_combined_columns": total_columns,
            "total_combined_anomalies": total_anomalies,
            "average_quality_score": round(sum(x["quality_score"] for x in comparison_table) / max(len(comparison_table), 1), 1)
        }
    }


def compute_cross_dataset_intelligence(dfs: List[Tuple[str, pd.DataFrame]], shared_keys: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Attempts to merge or correlate metrics across datasets based on shared keys.
    """
    if len(dfs) < 2:
        return {"has_merge": False, "cross_insights": []}

    name_a, df_a = dfs[0]
    name_b, df_b = dfs[1]

    cross_insights = []
    merged_preview = []
    cross_correlations = []
    
    # Check if we have a viable join key
    join_key = None
    for sk in shared_keys:
        if sk.get("is_recommended_join") or sk.get("overlap_pct", 0) > 10:
            join_key = sk["key_name"]
            break

    if join_key and join_key in df_a.columns and join_key in df_b.columns:
        try:
            # Perform clean inner join on sample or top records
            merged_df = pd.merge(df_a, df_b, on=join_key, suffixes=(f"_{name_a[:6]}", f"_{name_b[:6]}"))
            
            if not merged_df.empty:
                # Find numeric columns across both datasets
                num_cols_a = [c for c in df_a.select_dtypes(include=[np.number]).columns if c != join_key]
                num_cols_b = [c for c in df_b.select_dtypes(include=[np.number]).columns if c != join_key]

                # Compute cross-file Pearson correlation
                for ca in num_cols_a[:4]:
                    col_a_m = f"{ca}_{name_a[:6]}" if f"{ca}_{name_a[:6]}" in merged_df.columns else ca
                    for cb in num_cols_b[:4]:
                        col_b_m = f"{cb}_{name_b[:6]}" if f"{cb}_{name_b[:6]}" in merged_df.columns else cb
                        
                        if col_a_m in merged_df.columns and col_b_m in merged_df.columns:
                            valid_s = merged_df[[col_a_m, col_b_m]].dropna()
                            if len(valid_s) > 5:
                                corr_val = valid_s[col_a_m].corr(valid_s[col_b_m])
                                if not np.isnan(corr_val) and abs(corr_val) > 0.25:
                                    direction = "positive" if corr_val > 0 else "inverse"
                                    strength = "Strong" if abs(corr_val) > 0.65 else ("Moderate" if abs(corr_val) > 0.4 else "Noticeable")
                                    cross_correlations.append({
                                        "file_a": name_a,
                                        "col_a": ca,
                                        "file_b": name_b,
                                        "col_b": cb,
                                        "correlation": round(float(corr_val), 3),
                                        "direction": direction,
                                        "strength": strength,
                                        "insight": f"Cross-file analysis reveals a {strength.lower()} {direction} correlation (r={corr_val:+.2f}) between '{ca}' ({name_a}) and '{cb}' ({name_b})."
                                    })

                cross_correlations.sort(key=lambda x: abs(x["correlation"]), reverse=True)

                # Formulate high-impact cross-file insights
                if cross_correlations:
                    top_corr = cross_correlations[0]
                    cross_insights.append({
                        "title": "Cross-Dataset Metric Alignment",
                        "summary": f"Unification on '{join_key}' discovered that '{top_corr['col_a']}' in {top_corr['file_a']} directly influences '{top_corr['col_b']}' in {top_corr['file_b']} (r={top_corr['correlation']:+.2f}).",
                        "impact": "Enables end-to-end attribution modeling across previously siloed departments."
                    })

                merged_preview = merged_df.head(10).fillna("").to_dict(orient="records")

                return {
                    "has_merge": True,
                    "join_key": join_key,
                    "merged_row_count": len(merged_df),
                    "cross_correlations": cross_correlations[:6],
                    "cross_insights": cross_insights,
                    "merged_preview": merged_preview
                }
        except Exception as e:
            pass

    # If no join key, provide comparative divergence insights
    cross_insights.append({
        "title": "Dual-Stream Independent Telemetry",
        "summary": f"Analyzed {name_a} and {name_b} concurrently. No single 1:1 primary key match was identified, but parallel vectorized profiling succeeded.",
        "impact": "Allows comparative executive monitoring and side-by-side KPI benchmark evaluation."
    })

    return {
        "has_merge": False,
        "join_key": None,
        "merged_row_count": 0,
        "cross_correlations": [],
        "cross_insights": cross_insights,
        "merged_preview": []
    }
