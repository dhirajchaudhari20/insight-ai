import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
from services.data_loader import load_dataset_from_bytes
from services.column_detector import detect_all_column_types
from services.data_cleaner import clean_dataset
from services.analyzer import analyze_statistics
from services.correlation import compute_correlation_analysis
from services.outlier_detector import detect_outliers
from services.clustering import compute_clustering
from services.trend_analyzer import analyze_trends
from services.chart_recommender import recommend_charts
from services.insight_generator import generate_ai_insights

async def test_samples():
    for name in ["ecommerce_sales.csv", "saas_customer_churn.csv", "marketing_campaigns.csv", "hospital_records.csv", "financial_risk.csv"]:
        path = f"data/sample_datasets/{name}"
        print(f"\n================ Testing {name} ================")
        with open(path, "rb") as f:
            bytes_data = f.read()
        df_raw, err = load_dataset_from_bytes(bytes_data, name)
        assert err is None, f"Error loading {name}: {err}"
        print(f"Loaded raw: {df_raw.shape}")
        
        # 1. Column detection
        col_res = detect_all_column_types(df_raw)
        print(f"Detected columns summary: {col_res['summary']}")
        type_dict = {c['column_name']: c['detected_type'] for c in col_res['columns']}
        
        # 2. Cleaning
        df_clean, clean_rep = clean_dataset(df_raw, type_dict)
        print(f"Cleaned shape: {df_clean.shape}, Quality score: {clean_rep['quality_score']}, Dups removed: {clean_rep['rows_removed']}")
        
        # 3. Statistics
        stats = analyze_statistics(df_clean, type_dict)
        print(f"Numeric stats count: {len(stats['numeric_stats'])}, Categorical stats count: {len(stats['categorical_stats'])}")
        
        # 4. Correlation
        corr = compute_correlation_analysis(df_clean, type_dict)
        print(f"Correlation applicable: {corr['is_applicable']}, Top pairs: {len(corr['top_relationships'])}")
        
        # 5. Outliers
        outliers = detect_outliers(df_clean, type_dict)
        print(f"Outliers detected: {outliers['total_outlier_rows']} ({outliers['percentage_affected']}%)")
        
        # 6. Clustering
        clust = compute_clustering(df_clean, type_dict)
        print(f"Clustering applicable: {clust['is_applicable']}, Clusters count: {clust['clusters_count']}")
        
        # 7. Trends
        trends = analyze_trends(df_clean, type_dict)
        print(f"Trends applicable: {trends['is_applicable']}, Direction: {trends['direction']}")
        
        # 8. Charts
        charts = recommend_charts(df_clean, type_dict, corr, trends)
        print(f"Recommended charts count: {len(charts)}")
        for ch in charts:
            print(f"  - Chart: [{ch['type']}] {ch['title']} -> Takeaway: {ch['takeaway']}")
            
        # 9. AI Insights
        payload = {
            'overview': {'filename': name, 'total_rows': len(df_clean), 'total_columns': len(df_clean.columns)},
            'cleaning_report': clean_rep,
            'statistics': stats,
            'correlation': corr,
            'outliers': outliers,
            'clustering': clust,
            'trends': trends,
            'charts': charts
        }
        insights = await generate_ai_insights(payload)
        print(f"Insights generator: {insights.get('generator')}")
        print(f"Executive Summary: {insights.get('executive_summary')[:120]}...")
        print(f"Key insights count: {len(insights.get('key_insights', []))}")
        print(f"First key insight: {insights.get('key_insights', [{}])[0].get('insight')}")
        print(f"First evidence: {insights.get('key_insights', [{}])[0].get('evidence')}")

asyncio.run(test_samples())
