import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List

def detect_outliers(df: pd.DataFrame, detected_types: Dict[str, str]) -> Dict[str, Any]:
    """
    Identifies outliers using the Interquartile Range (IQR) method and Isolation Forest.
    """
    numeric_cols = [c for c in df.columns if detected_types.get(c) == 'numeric']
    
    if not numeric_cols:
        return {
            'total_outlier_rows': 0,
            'percentage_affected': 0.0,
            'affected_columns_count': 0,
            'column_outliers': [],
            'multivariate_outliers_count': 0,
            'outlier_scatter_data': []
        }
        
    num_df = df[numeric_cols].apply(pd.to_numeric, errors='coerce').fillna(0)
    total_rows = len(df)
    
    outlier_row_indices = set()
    column_outliers: List[Dict[str, Any]] = []
    
    # 1. IQR Method on individual numeric columns
    for col in numeric_cols:
        series = num_df[col]
        q25 = float(series.quantile(0.25))
        q75 = float(series.quantile(0.75))
        iqr = q75 - q25
        
        if iqr > 1e-6:
            lower_bound = q25 - 1.5 * iqr
            upper_bound = q75 + 1.5 * iqr
            outlier_mask = (series < lower_bound) | (series > upper_bound)
            count = int(outlier_mask.sum())
            
            if count > 0:
                indices = series[outlier_mask].index.tolist()
                outlier_row_indices.update(indices)
                extreme_samples = series[outlier_mask].iloc[:4].round(2).tolist()
                
                column_outliers.append({
                    'column_name': col,
                    'outlier_count': count,
                    'percentage': round(count / total_rows * 100, 2),
                    'lower_bound': round(lower_bound, 2),
                    'upper_bound': round(upper_bound, 2),
                    'sample_values': extreme_samples,
                    'description': f"{col} contains {count} potential outlier{'s' if count > 1 else ''} outside [{round(lower_bound, 1)}, {round(upper_bound, 1)}]."
                })

    # Sort column outliers by count descending
    column_outliers.sort(key=lambda x: x['outlier_count'], reverse=True)
    
    # 2. Multivariate Isolation Forest (if >= 20 rows and >= 2 numeric columns)
    multivariate_count = 0
    if total_rows >= 20 and len(numeric_cols) >= 2:
        try:
            from sklearn.preprocessing import StandardScaler
            scaler = StandardScaler()
            # If dataset is very large, sample for isolation forest fitting
            if total_rows > 5000:
                sample_num = num_df.sample(n=5000, random_state=42)
                scaled_vals = scaler.fit_transform(sample_num)
                iso = IsolationForest(contamination=0.03, max_samples=256, n_estimators=40, random_state=42, n_jobs=-1)
                preds = iso.fit_predict(scaled_vals)
                # Extrapolate estimated multivariate outliers for total rows
                sample_outlier_pct = (preds == -1).sum() / len(preds)
                multivariate_count = int(round(sample_outlier_pct * total_rows))
            else:
                scaled_vals = scaler.fit_transform(num_df)
                iso = IsolationForest(contamination='auto', max_samples=min(256, total_rows), n_estimators=50, random_state=42, n_jobs=-1)
                preds = iso.fit_predict(scaled_vals)
                multivariate_count = int((preds == -1).sum())
        except Exception:
            multivariate_count = 0

    # Prepare outlier scatter sample points for visualization (top 2 numeric features)
    outlier_scatter_data = []
    if len(numeric_cols) >= 2:
        f1, f2 = numeric_cols[0], numeric_cols[1]
        sample_df = df[[f1, f2]].copy().dropna()
        sample_indices = set(sample_df.index) & outlier_row_indices
        
        # Take up to 60 sample points for fast chart rendering
        for idx, row in sample_df.head(60).iterrows():
            is_out = idx in sample_indices
            outlier_scatter_data.append({
                'x': round(float(row[f1]), 2),
                'y': round(float(row[f2]), 2),
                'is_outlier': is_out,
                'status': 'Outlier' if is_out else 'Normal'
            })

    total_affected = len(outlier_row_indices)
    pct_affected = round((total_affected / total_rows * 100), 2) if total_rows > 0 else 0.0

    return {
        'total_outlier_rows': total_affected,
        'percentage_affected': pct_affected,
        'affected_columns_count': len(column_outliers),
        'column_outliers': column_outliers,
        'multivariate_outliers_count': multivariate_count,
        'outlier_scatter_data': outlier_scatter_data
    }
