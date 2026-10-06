import pandas as pd
import numpy as np
from typing import Dict, Any, List

def recommend_charts(
    df: pd.DataFrame,
    detected_types: Dict[str, str],
    correlation_data: Dict[str, Any],
    trend_data: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Intelligently recommends and prepares top 4-6 high-value charts based on available columns.
    Every chart includes title, axis labels, ready-to-plot formatted data, and an automated takeaway.
    """
    charts: List[Dict[str, Any]] = []
    
    numeric_cols = [c for c in df.columns if detected_types.get(c) == 'numeric']
    categorical_cols = [c for c in df.columns if detected_types.get(c) == 'categorical']
    date_cols = [c for c in df.columns if detected_types.get(c) == 'date']
    
    # 1. Chart Type 1: Time Series Trend (Date + Primary Numeric)
    if trend_data.get('is_applicable') and trend_data.get('trend_data'):
        t_pts = trend_data['trend_data']
        d_col = trend_data['date_column']
        n_col = trend_data['numeric_column']
        direction = trend_data.get('direction', 'Steady')
        rate = trend_data.get('growth_rate_pct', 0.0)
        
        # Take up to 25 points for crisp line rendering
        step = max(1, len(t_pts) // 25)
        sampled_trend = t_pts[::step]
        
        takeaway = (
            f"{n_col} demonstrated an overall {direction.lower()} pattern "
            f"({rate:+.1f}% change) across the observed timeline."
        )
        
        charts.append({
            'id': 'time_series_trend',
            'type': 'area',
            'title': f"{n_col} Over Time",
            'subtitle': f"Temporal trajectory segmented by {d_col}",
            'xAxisKey': 'period',
            'yAxisKey': 'total',
            'xAxisLabel': 'Period',
            'yAxisLabel': f"Total {n_col}",
            'data': sampled_trend,
            'takeaway': takeaway,
            'category': 'Trends'
        })

    # 2. Chart Type 2: Categorical Comparison Bar Chart (Top Categorical + Primary Numeric)
    if categorical_cols and numeric_cols:
        cat_col = categorical_cols[0]
        num_col = numeric_cols[0]
        
        # Group by category and compute aggregate sum and mean
        grouped = (
            df.groupby(cat_col)[num_col]
            .agg(['sum', 'count'])
            .reset_index()
            .sort_values(by='sum', ascending=False)
            .head(8)
        )
        
        bar_data = []
        for _, row in grouped.iterrows():
            bar_data.append({
                'category': str(row[cat_col]),
                'value': round(float(row['sum']), 2),
                'count': int(row['count'])
            })
            
        if bar_data:
            top_category = bar_data[0]['category']
            top_val = bar_data[0]['value']
            total_sum = sum(b['value'] for b in bar_data)
            share_pct = round((top_val / total_sum * 100), 1) if total_sum > 0 else 0
            
            takeaway = f"'{top_category}' leads all categories with {top_val:,.2f} {num_col} ({share_pct}% of top categories)."
            
            charts.append({
                'id': 'category_comparison_bar',
                'type': 'bar',
                'title': f"{num_col} by {cat_col}",
                'subtitle': f"Comparative total across top {cat_col} groups",
                'xAxisKey': 'category',
                'yAxisKey': 'value',
                'xAxisLabel': cat_col,
                'yAxisLabel': f"Total {num_col}",
                'data': bar_data,
                'takeaway': takeaway,
                'category': 'Comparisons'
            })

    # 3. Chart Type 3: Categorical Proportion Donut / Pie Chart
    # Use a categorical column with modest unique count (3 to 8)
    suitable_cats = [c for c in categorical_cols if 2 <= df[c].nunique() <= 8]
    cat_for_donut = suitable_cats[0] if suitable_cats else (categorical_cols[0] if categorical_cols else None)
    
    if cat_for_donut:
        val_counts = df[cat_for_donut].value_counts().head(6)
        total_records = len(df)
        donut_data = []
        for cat, cnt in val_counts.items():
            donut_data.append({
                'name': str(cat),
                'value': int(cnt),
                'percentage': round(cnt / total_records * 100, 1)
            })
            
        if donut_data:
            dominant = donut_data[0]['name']
            dom_pct = donut_data[0]['percentage']
            takeaway = f"'{dominant}' represents the largest segment at {dom_pct}% of total records."
            
            charts.append({
                'id': 'category_donut_distribution',
                'type': 'donut',
                'title': f"Distribution of {cat_for_donut}",
                'subtitle': f"Composition of records across {cat_for_donut}",
                'xAxisKey': 'name',
                'yAxisKey': 'value',
                'xAxisLabel': cat_for_donut,
                'yAxisLabel': 'Record Count',
                'data': donut_data,
                'takeaway': takeaway,
                'category': 'Composition'
            })

    # 4. Chart Type 4: Numeric Bivariate Relationship (Scatter Plot)
    top_rels = correlation_data.get('top_relationships', [])
    if top_rels:
        top_rel = top_rels[0]
        f1 = top_rel['feature_a']
        f2 = top_rel['feature_b']
        r_val = top_rel['correlation']
        
        sample_df = df[[f1, f2]].dropna().head(60)
        scatter_data = []
        for _, row in sample_df.iterrows():
            scatter_data.append({
                'x': round(float(row[f1]), 2),
                'y': round(float(row[f2]), 2)
            })
            
        takeaway = (
            f"{f1} and {f2} display a {top_rel['strength'].lower()} {top_rel['direction']} "
            f"relationship (correlation coefficient r = {r_val:+.2f})."
        )
        
        charts.append({
            'id': 'bivariate_scatter',
            'type': 'scatter',
            'title': f"{f1} vs. {f2}",
            'subtitle': f"Relationship correlation: {r_val:+.2f} ({top_rel['strength']})",
            'xAxisKey': 'x',
            'yAxisKey': 'y',
            'xAxisLabel': f1,
            'yAxisLabel': f2,
            'data': scatter_data,
            'takeaway': takeaway,
            'category': 'Correlations'
        })

    # 5. Chart Type 5: Numeric Distribution (Histogram / Binned Bar)
    # Pick a key numeric column with high variance
    if numeric_cols:
        target_num = numeric_cols[1] if len(numeric_cols) > 1 else numeric_cols[0]
        num_clean = pd.to_numeric(df[target_num], errors='coerce').dropna()
        
        if len(num_clean) >= 10:
            bins = 7
            counts, bin_edges = np.histogram(num_clean, bins=bins)
            hist_data = []
            for i in range(len(counts)):
                range_label = f"{round(bin_edges[i], 1)} - {round(bin_edges[i+1], 1)}"
                hist_data.append({
                    'range': range_label,
                    'frequency': int(counts[i])
                })
                
            median_val = round(float(num_clean.median()), 2)
            takeaway = f"Most observations for {target_num} cluster near the median of {median_val:,}."
            
            charts.append({
                'id': 'numeric_distribution_hist',
                'type': 'bar',
                'title': f"Distribution of {target_num}",
                'subtitle': f"Frequency histogram binned across 7 ranges",
                'xAxisKey': 'range',
                'yAxisKey': 'frequency',
                'xAxisLabel': f"Range of {target_num}",
                'yAxisLabel': 'Count of Records',
                'data': hist_data,
                'takeaway': takeaway,
                'category': 'Distributions'
            })

    # 6. Chart Type 6: Secondary Categorical or Metric Comparison (if available)
    if len(categorical_cols) >= 2 and numeric_cols:
        cat_col2 = categorical_cols[1]
        num_col2 = numeric_cols[0]
        
        grouped2 = (
            df.groupby(cat_col2)[num_col2]
            .mean()
            .reset_index()
            .sort_values(by=num_col2, ascending=False)
            .head(6)
        )
        
        bar_data2 = [
            {'category': str(row[cat_col2]), 'value': round(float(row[num_col2]), 2)}
            for _, row in grouped2.iterrows()
        ]
        
        if bar_data2:
            top_c2 = bar_data2[0]['category']
            top_v2 = bar_data2[0]['value']
            takeaway = f"'{top_c2}' yielded the highest average {num_col2} at {top_v2:,.2f}."
            
            charts.append({
                'id': 'secondary_cat_comparison',
                'type': 'bar',
                'title': f"Average {num_col2} by {cat_col2}",
                'subtitle': f"Benchmark comparison by {cat_col2}",
                'xAxisKey': 'category',
                'yAxisKey': 'value',
                'xAxisLabel': cat_col2,
                'yAxisLabel': f"Average {num_col2}",
                'data': bar_data2,
                'takeaway': takeaway,
                'category': 'Comparisons'
            })

    return charts
