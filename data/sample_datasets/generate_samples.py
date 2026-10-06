import csv
import random
from datetime import datetime, timedelta

random.seed(42)

# 1. E-Commerce Sales Dataset (approx 250 rows with dates, numbers, categories, outliers, duplicates)
cities = ["New York", "San Francisco", "Austin", "Chicago", "Seattle", "Boston", "Denver"]
categories = ["Electronics", "Apparel", "Home & Kitchen", "Books", "Fitness", "Beauty"]
payment_methods = ["Credit Card", "PayPal", "Apple Pay", "Debit Card"]
channels = ["Online", "In-Store", "Mobile App"]

start_date = datetime(2024, 1, 1)
sales_data = []

for i in range(1, 260):
    date_val = (start_date + timedelta(days=i % 180)).strftime("%Y-%m-%d")
    cat = random.choice(categories)
    city = random.choice(cities)
    
    # realistic distributions with occasional missing values or outliers
    qty = random.randint(1, 10)
    if cat == "Electronics":
        base_price = random.uniform(200, 1200)
    elif cat == "Apparel":
        base_price = random.uniform(30, 150)
    elif cat == "Home & Kitchen":
        base_price = random.uniform(40, 250)
    else:
        base_price = random.uniform(15, 80)
    
    revenue = round(qty * base_price, 2)
    profit_margin = random.uniform(0.12, 0.45)
    profit = round(revenue * profit_margin, 2)
    discount = round(random.choice([0.0, 0.05, 0.10, 0.15, 0.20]), 2)
    rating = round(random.uniform(3.0, 5.0), 1)
    
    # Introduce some outliers
    if i in [15, 88, 142]:
        revenue = round(revenue * 8.5, 2)
        profit = round(profit * 6.0, 2)
    
    # Introduce occasional null / missing values to test auto-cleaner
    city_val = "" if i in [7, 43, 112] else city
    discount_val = "" if i in [23, 77] else discount
    rating_val = "" if i in [35, 99] else rating
    
    sales_data.append({
        "Order_ID": f"ORD-{1000 + i}",
        "Order_Date": date_val,
        "City": city_val,
        "Category": cat,
        "Units_Sold": qty,
        "Revenue": revenue,
        "Profit": profit,
        "Discount_Rate": discount_val,
        "Customer_Rating": rating_val,
        "Payment_Method": random.choice(payment_methods),
        "Sales_Channel": random.choice(channels)
    })

# Add 4 duplicate rows to test deduplication
sales_data.append(dict(sales_data[10]))
sales_data.append(dict(sales_data[25]))
sales_data.append(dict(sales_data[50]))

with open("/Users/dhirajchaudhari/hackhathon/data/sample_datasets/ecommerce_sales.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=list(sales_data[0].keys()))
    writer.writeheader()
    writer.writerows(sales_data)

# 2. SaaS Customer Churn Dataset
tiers = ["Starter", "Professional", "Enterprise"]
churn_data = []
for i in range(1, 220):
    tier = random.choice(tiers)
    if tier == "Enterprise":
        monthly = random.uniform(450, 1500)
        tenure = random.randint(12, 48)
        seats = random.randint(20, 100)
    elif tier == "Professional":
        monthly = random.uniform(99, 299)
        tenure = random.randint(3, 36)
        seats = random.randint(5, 25)
    else:
        monthly = random.uniform(29, 79)
        tenure = random.randint(1, 18)
        seats = random.randint(1, 5)
    
    login_freq = random.randint(5, 30)
    support_tickets = random.randint(0, 8)
    nps_score = random.randint(2, 10)
    churn = "Yes" if (support_tickets > 4 and login_freq < 10) or (nps_score < 4 and random.random() > 0.4) else "No"
    
    # Missing values
    nps_val = "" if i in [12, 60] else nps_score
    monthly_val = "" if i in [30] else round(monthly, 2)
    
    churn_data.append({
        "Customer_ID": f"CUST-{2000 + i}",
        "Subscription_Tier": tier,
        "Tenure_Months": tenure,
        "Monthly_Charges": monthly_val,
        "Active_Seats": seats,
        "Monthly_Logins": login_freq,
        "Support_Tickets": support_tickets,
        "NPS_Score": nps_val,
        "Contract_Type": random.choice(["Monthly", "Annual", "Two-Year"]),
        "Churn": churn
    })

# Add duplicates
churn_data.append(dict(churn_data[5]))
churn_data.append(dict(churn_data[40]))

with open("/Users/dhirajchaudhari/hackhathon/data/sample_datasets/saas_customer_churn.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=list(churn_data[0].keys()))
    writer.writeheader()
    writer.writerows(churn_data)

# 3. Marketing Campaigns Dataset
channels_mkt = ["Google Search", "Meta Ads", "LinkedIn Ads", "YouTube Video", "Newsletter", "Organic SEO"]
campaign_data = []
mkt_start = datetime(2024, 3, 1)

for i in range(1, 200):
    ch = random.choice(channels_mkt)
    c_date = (mkt_start + timedelta(days=i % 120)).strftime("%Y-%m-%d")
    
    spend = round(random.uniform(500, 8000), 2)
    cpm = random.uniform(8, 35)
    impressions = int((spend / cpm) * 1000)
    ctr = random.uniform(0.015, 0.055)
    clicks = int(impressions * ctr)
    conv_rate = random.uniform(0.02, 0.12)
    conversions = int(clicks * conv_rate)
    revenue_gen = round(conversions * random.uniform(80, 300), 2)
    roas = round(revenue_gen / spend, 2) if spend > 0 else 0
    
    campaign_data.append({
        "Campaign_ID": f"CMP-{3000 + i}",
        "Campaign_Date": c_date,
        "Channel": ch,
        "Ad_Spend": spend,
        "Impressions": impressions,
        "Clicks": clicks,
        "Conversions": conversions,
        "Revenue_Generated": revenue_gen,
        "ROAS": roas,
        "Target_Audience": random.choice(["B2B Decision Makers", "Tech Enthusiasts", "Small Business Owners", "General Consumers"])
    })

# Add duplicates
campaign_data.append(dict(campaign_data[15]))

with open("/Users/dhirajchaudhari/hackhathon/data/sample_datasets/marketing_campaigns.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=list(campaign_data[0].keys()))
    writer.writeheader()
    writer.writerows(campaign_data)

print("Sample datasets generated successfully!")
