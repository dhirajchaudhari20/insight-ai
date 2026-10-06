# InsightAI — Automated Data Analyst

> **Problem Statement 3: "The Automated Insight Analyst — End-to-End Dashboard Engine"**  
> An autonomous data science and business intelligence engine that ingests any spreadsheet dataset (CSV / XLSX), automatically detects data types, cleans anomalies, runs machine learning & statistical analysis, recommends optimal visualizations, and synthesizes evidence-backed executive insights.

---

## 🌟 Key Capabilities

1. **100% Generic & Unseen Dataset Ready**:
   - Zero hardcoded dataset or column names.
   - Robust value-based inference engine that distinguishes numeric, categorical, date, and text columns from cell patterns and variance.

2. **Automated Data Cleaning Engine**:
   - Exact duplicate row detection and removal.
   - Smart imputation: median for continuous numeric variables, mode / "Unknown" for discrete categorical features.
   - Normalization of currency symbols (`$`, `€`, `£`), percentages (`%`), whitespace, and ISO dates (`YYYY-MM-DD`).
   - Audit trail and **Data Quality Score (0–100)** calculation.

3. **Data Science & ML Analytics Engine**:
   - **Descriptive Statistics**: Mean, median, standard deviation, min, max, quartiles (Q1, Q3), and skewness.
   - **Correlation Analysis**: Pearson correlation matrix, top relationships ranked, and strictly non-causal language.
   - **Outlier Detection**: Interquartile Range (IQR) method and multivariate Isolation Forest.
   - **KMeans Clustering**: Dynamic $k$ selection using silhouette score and StandardScaler normalization.
   - **Chronological Trend Analysis**: Automatic time-series detection and growth trajectory calculation.

4. **Intelligent Chart Recommendation Engine**:
   - Recommends 5–6 best-fit charts (Area, Bar, Donut, Scatter) based on schema taxonomy.
   - **Automated Plain-Language Takeaway Banner** generated under every chart explaining its business meaning.

5. **AI Insights & Evidence Grounding**:
   - Modular LLM support (`GROQ_API_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY`).
   - **Zero-Hallucination Deterministic Engine**: When running offline or without an API key, synthesizes an Executive Summary, Top 5 Key Insights with attached empirical evidence badges, Anomalies (⚠️), Trends (📈), Relationships (🔗), Segments (👥), and Strategic Recommendations (💡).

6. **Exports & Demo Mode**:
   - 1-click Demo Datasets included:
     - *E-Commerce Multi-Channel Sales*
     - *SaaS Customer Behavior & Churn*
     - *Digital Marketing & ROAS Telemetry*
   - Export cleaned data as CSV.
   - Download complete Executive Analysis Report in Markdown.

---

## 🛠️ Architecture & Tech Stack

```
insightai/
├── backend/
│   ├── main.py                  # FastAPI endpoints & CORS
│   ├── services/
│   │   ├── data_loader.py       # Multi-format CSV/XLSX reader
│   │   ├── column_detector.py   # Value-based inference engine
│   │   ├── data_cleaner.py      # Deduplication & smart imputation
│   │   ├── analyzer.py          # Descriptive statistics
│   │   ├── correlation.py       # Pearson correlation matrix
│   │   ├── outlier_detector.py  # IQR & Isolation Forest
│   │   ├── clustering.py        # KMeans & Silhouette evaluation
│   │   ├── trend_analyzer.py    # Time-series periodicity & growth
│   │   ├── chart_recommender.py # Chart recommendation & takeaways
│   │   └── insight_generator.py # Grounded AI & deterministic fallback
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Sidebar, Stepper, UploadModal
│   │   ├── views/               # Dashboard, DataQuality, Analytics, Visualizations, AiInsights
│   │   ├── services/api.js      # Backend API connector
│   │   └── utils/               # Report generation & exports
└── data/sample_datasets/        # Benchmark demo datasets
```

- **Backend**: Python 3.11, FastAPI, Pandas, NumPy, Scikit-Learn, SciPy, Openpyxl, Uvicorn.
- **Frontend**: React 19, Vite, Tailwind CSS v4, Recharts, Lucide React, Canvas Confetti.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```
Backend API will be running at `http://127.0.0.1:8000` (docs at `http://127.0.0.1:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running at `http://localhost:5173`.

---

## ⚙️ Environment Variables (Optional)

Create a `.env` file in the root or `backend/` directory if you wish to use an external LLM:

```env
# Optional LLM API Keys (InsightAI includes a rich deterministic fallback engine if omitted)
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 📋 End-to-End Workflow

1. **Upload / Select Dataset**: Drag & drop any `.csv` or `.xlsx` spreadsheet, or click **"Try A Demo Dataset"**.
2. **Autonomous Pipeline**: Observe the multi-stage progress tracker as InsightAI inspects, cleans, analyzes, and recommends charts.
3. **Explore the 5 Dedicated Views**:
   - **Dashboard**: High-level telemetry, stat counters, and top chart highlights.
   - **Data Quality**: Circular quality gauge (0-100), cleaning action log, and column type table.
   - **Analytics**: Descriptive stats, correlation heatmap, IQR outliers, KMeans segmentation, and trends.
   - **Visualizations**: Interactive charts paired with plain-language takeaways.
   - **AI Insights**: Grounded executive briefing, top 5 findings with attached evidence, anomalies, and recommendations.
4. **Export**: Download the cleaned CSV dataset or the full Markdown Executive Analysis Report.
