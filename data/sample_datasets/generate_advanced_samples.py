import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta

DATA_DIR = Path(__file__).resolve().parent

np.random.seed(42)

def generate_multi_region():
    dates = [datetime(2026, 1, 1) + timedelta(days=i) for i in range(120)]
    
    # East Region
    east_data = []
    for d in dates:
        for cat in ['Electronics', 'Home & Living', 'Apparel']:
            units = np.random.randint(15, 80)
            revenue = round(units * np.random.uniform(40, 180), 2)
            margin = round(revenue * np.random.uniform(0.18, 0.35), 2)
            satisfaction = round(np.random.uniform(4.0, 5.0), 1)
            east_data.append({
                'date': d.strftime('%Y-%m-%d'),
                'region': 'East Coast',
                'category': cat,
                'units_sold': units,
                'revenue_usd': revenue,
                'operating_margin': margin,
                'customer_csat': satisfaction,
                'fulfillment_center': np.random.choice(['NY-HUB-1', 'BOS-HUB-2', 'ATL-HUB-3'])
            })
    pd.DataFrame(east_data).to_csv(DATA_DIR / 'sales_east_region.csv', index=False)
    print("Created sales_east_region.csv")

    # West Region
    west_data = []
    for d in dates:
        for cat in ['Electronics', 'Home & Living', 'Apparel']:
            units = np.random.randint(20, 95)
            revenue = round(units * np.random.uniform(45, 195), 2)
            margin = round(revenue * np.random.uniform(0.22, 0.40), 2)
            satisfaction = round(np.random.uniform(3.8, 4.9), 1)
            west_data.append({
                'date': d.strftime('%Y-%m-%d'),
                'region': 'West Coast',
                'category': cat,
                'units_sold': units,
                'revenue_usd': revenue,
                'operating_margin': margin,
                'customer_csat': satisfaction,
                'fulfillment_center': np.random.choice(['SF-HUB-1', 'SEA-HUB-2', 'LA-HUB-3'])
            })
    pd.DataFrame(west_data).to_csv(DATA_DIR / 'sales_west_region.csv', index=False)
    print("Created sales_west_region.csv")

def generate_enterprise_100k():
    n_rows = 100_000
    dates = pd.date_range(start='2025-01-01', end='2026-06-30', periods=n_rows)
    regions = np.random.choice(['North America', 'EMEA', 'APAC', 'LATAM'], size=n_rows, p=[0.4, 0.3, 0.2, 0.1])
    channels = np.random.choice(['Direct Enterprise', 'Channel Partner', 'Self-Serve Cloud', 'Strategic Reseller'], size=n_rows)
    categories = np.random.choice(['Cloud Computing', 'Data Infrastructure', 'AI Acceleration', 'Security & Compliance'], size=n_rows)
    
    # Vectorized numeric generation for speed
    transaction_amounts = np.round(np.random.exponential(scale=1200, size=n_rows) + 150, 2)
    # Inject outliers
    outlier_indices = np.random.choice(n_rows, size=350, replace=False)
    transaction_amounts[outlier_indices] = np.round(np.random.uniform(25000, 95000, size=350), 2)
    
    discounts = np.round(np.random.beta(a=2, b=10, size=n_rows) * 0.40, 3)
    latency_ms = np.random.normal(loc=45, scale=12, size=n_rows).clip(5, 180).round(1)
    nps_score = np.random.randint(1, 11, size=n_rows)

    df_100k = pd.DataFrame({
        'transaction_id': [f"TXN-{1000000 + i}" for i in range(n_rows)],
        'timestamp': dates.strftime('%Y-%m-%d %H:%M'),
        'region': regions,
        'sales_channel': channels,
        'product_suite': categories,
        'contract_value_usd': transaction_amounts,
        'discount_rate': discounts,
        'sla_latency_ms': latency_ms,
        'client_nps': nps_score
    })
    
    df_100k.to_csv(DATA_DIR / 'enterprise_global_100k.csv', index=False)
    print(f"Created enterprise_global_100k.csv with {len(df_100k):,} rows")

if __name__ == '__main__':
    generate_multi_region()
    generate_enterprise_100k()
