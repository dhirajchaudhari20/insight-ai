import pandas as pd
import numpy as np
from typing import Dict, Any, List

def analyze_trends(df: pd.DataFrame, detected_types: Dict[str, str]) -> Dict[str, Any]:
    """
    Identifies chronological trends by pairing date column with primary numeric metrics.
    Aggregates dynamically (daily, weekly, or monthly) and computes direction and momentum.
    """
    date_cols = [c for c in df.columns if detected_types.get(c) == 'date']
    numeric_cols = [c for c in df.columns if detected_types.get(c) == 'numeric']
    
    if not date_cols or not numeric_cols:
        return {
            'is_applicable': False,
            'message': 'No date column or numeric metric found for trend analysis.',
            'date_column': None,
            'numeric_column': None,
            'trend_data': [],
            'direction': 'None',
            'growth_rate_pct': 0.0,
            'summary': 'Trend analysis not applicable for this dataset.'
        }
        
    date_col = date_cols[0]
    num_col = numeric_cols[0]
    
    # Parse dates
    df_trend = df[[date_col, num_col]].copy()
    df_trend['__date__'] = pd.to_datetime(df_trend[date_col], errors='coerce')
    df_trend['__num__'] = pd.to_numeric(df_trend[num_col], errors='coerce')
    df_trend = df_trend.dropna(subset=['__date__', '__num__']).sort_values('__date__')
    
    if len(df_trend) < 3:
        return {
            'is_applicable': False,
            'message': 'Insufficient chronological data points for trend analysis.',
            'date_column': date_col,
            'numeric_column': num_col,
            'trend_data': [],
            'direction': 'None',
            'growth_rate_pct': 0.0,
            'summary': 'Not enough temporal data.'
        }

    date_range = (df_trend['__date__'].max() - df_trend['__date__'].min()).days
    
    # Determine aggregation frequency
    if date_range > 365 * 2:
        freq = 'YE' # yearly
        fmt = '%Y'
    elif date_range > 90:
        freq = 'ME' # monthly
        fmt = '%Y-%m'
    elif date_range > 14:
        freq = 'W' # weekly
        fmt = '%Y-%m-%d'
    else:
        freq = 'D' # daily
        fmt = '%Y-%m-%d'
        
    try:
        grouped = df_trend.set_index('__date__').resample(freq)['__num__'].agg(['sum', 'count', 'mean']).reset_index()
        grouped = grouped.dropna(subset=['sum'])
    except Exception:
        # Fallback grouping
        grouped = df_trend.groupby('__date__')['__num__'].agg(['sum', 'count', 'mean']).reset_index()
        fmt = '%Y-%m-%d'

    # Convert to chart items
    trend_points: List[Dict[str, Any]] = []
    for _, row in grouped.iterrows():
        dt_str = row['__date__'].strftime(fmt)
        trend_points.append({
            'period': dt_str,
            'total': round(float(row['sum']), 2),
            'average': round(float(row['mean']), 2),
            'volume': int(row['count'])
        })

    # Compute overall trend direction
    direction = "Steady"
    growth_rate = 0.0
    if len(trend_points) >= 2:
        first_val = trend_points[0]['total']
        last_val = trend_points[-1]['total']
        if first_val > 0:
            growth_rate = round(((last_val - first_val) / first_val) * 100, 1)
            
        if growth_rate > 10.0:
            direction = "Upward"
        elif growth_rate < -10.0:
            direction = "Downward"
        else:
            direction = "Stable"

    summary_text = (
        f"{num_col} shows an overall {direction.lower()} trend across {len(trend_points)} recorded intervals "
        f"({trend_points[0]['period']} to {trend_points[-1]['period']}) with a {abs(growth_rate)}% "
        f"{'growth' if growth_rate >= 0 else 'reduction'}."
    )

    return {
        'is_applicable': True,
        'message': f"Computed chronological trend using '{date_col}' against '{num_col}'.",
        'date_column': date_col,
        'numeric_column': num_col,
        'trend_data': trend_points,
        'direction': direction,
        'growth_rate_pct': growth_rate,
        'summary': summary_text
    }
