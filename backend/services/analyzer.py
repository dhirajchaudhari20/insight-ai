import pandas as pd
import numpy as np
from typing import Dict, Any, List

def analyze_statistics(df: pd.DataFrame, detected_types: Dict[str, str]) -> Dict[str, Any]:
    """
    Computes comprehensive descriptive statistics for numeric and categorical columns.
    """
    numeric_stats: List[Dict[str, Any]] = []
    categorical_stats: List[Dict[str, Any]] = []
    
    for col in df.columns:
        col_type = detected_types.get(col, 'categorical')
        series = df[col]
        
        if col_type == 'numeric':
            numeric_series = pd.to_numeric(series, errors='coerce').dropna()
            if len(numeric_series) > 0:
                mean_val = float(numeric_series.mean())
                median_val = float(numeric_series.median())
                std_val = float(numeric_series.std()) if len(numeric_series) > 1 else 0.0
                min_val = float(numeric_series.min())
                max_val = float(numeric_series.max())
                q25_val = float(numeric_series.quantile(0.25))
                q75_val = float(numeric_series.quantile(0.75))
                skew_val = float(numeric_series.skew()) if len(numeric_series) > 2 else 0.0
                
                # Check for nan
                std_val = 0.0 if np.isnan(std_val) else std_val
                skew_val = 0.0 if np.isnan(skew_val) else skew_val

                numeric_stats.append({
                    'column_name': col,
                    'count': int(len(numeric_series)),
                    'mean': round(mean_val, 2),
                    'median': round(median_val, 2),
                    'std': round(std_val, 2),
                    'min': round(min_val, 2),
                    'max': round(max_val, 2),
                    'q25': round(q25_val, 2),
                    'q75': round(q75_val, 2),
                    'skewness': round(skew_val, 2)
                })
                
        elif col_type == 'categorical':
            clean_series = series.dropna().astype(str)
            if len(clean_series) > 0:
                val_counts = clean_series.value_counts()
                top_cat = str(val_counts.index[0])
                top_freq = int(val_counts.iloc[0])
                top_pct = round((top_freq / len(clean_series) * 100), 1)
                
                # Limit distribution to top 8 items + "Other"
                top_items = val_counts.head(8)
                dist = [{'category': str(cat), 'count': int(cnt), 'percentage': round(cnt / len(clean_series) * 100, 1)}
                        for cat, cnt in top_items.items()]
                
                if len(val_counts) > 8:
                    other_cnt = int(val_counts.iloc[8:].sum())
                    dist.append({
                        'category': 'Other',
                        'count': other_cnt,
                        'percentage': round(other_cnt / len(clean_series) * 100, 1)
                    })

                categorical_stats.append({
                    'column_name': col,
                    'unique_count': int(clean_series.nunique()),
                    'most_frequent': top_cat,
                    'most_frequent_count': top_freq,
                    'most_frequent_pct': top_pct,
                    'distribution': dist
                })

    return {
        'numeric_stats': numeric_stats,
        'categorical_stats': categorical_stats
    }
