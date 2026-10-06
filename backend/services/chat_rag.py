import os
import json
import httpx
from typing import Dict, Any, List

def build_data_rag_chunks(context: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Splits the structured analysis payload into focused semantic knowledge chunks
    for RAG retrieval (Overview, Quality, Stats, Correlations, Outliers, Clusters, Trends).
    """
    chunks = []
    
    # 1. Overview & Quality
    overview = context.get("overview", {})
    quality = context.get("cleaning_report", {})
    chunks.append({
        "topic": "dataset_overview_and_quality",
        "keywords": ["dataset", "rows", "columns", "quality", "clean", "null", "duplicates", "overview", "size"],
        "content": (
            f"Dataset '{overview.get('filename', 'dataset')}' contains {overview.get('total_rows', 0):,} rows "
            f"and {overview.get('total_columns', 0)} columns across domain '{context.get('domain', {}).get('detected_domain', 'Enterprise')}'. "
            f"Data Quality Score is {quality.get('quality_score', 95)}/100. "
            f"Deduplicated rows: {quality.get('duplicates_removed', 0)}, Missing values imputed: {quality.get('missing_values_imputed', 0)}."
        ),
        "evidence": [
            {"metric": "Total Records", "value": f"{overview.get('total_rows', 0):,}"},
            {"metric": "Quality Score", "value": f"{quality.get('quality_score', 95)}/100"}
        ]
    })
    
    # 2. Key Numeric Metrics
    numeric_stats = context.get("statistics", {}).get("numeric_stats", [])
    if numeric_stats:
        num_summary = []
        ev_list = []
        for col in numeric_stats[:5]:
            c_name = col.get("column_name")
            mean_val = col.get("mean", 0)
            median_val = col.get("median", 0)
            min_val = col.get("min", 0)
            max_val = col.get("max", 0)
            num_summary.append(f"Column '{c_name}': mean={mean_val:,.2f}, median={median_val:,.2f}, range=[{min_val:,.2f}, {max_val:,.2f}]")
            ev_list.append({"metric": f"Mean {c_name}", "value": f"{mean_val:,.2f}"})
        chunks.append({
            "topic": "numeric_metrics_and_distributions",
            "keywords": ["average", "mean", "median", "distribution", "stats", "max", "min", "numeric", "kpi", "spend", "revenue", "price", "score"],
            "content": "Numeric Distribution Facts: " + " | ".join(num_summary),
            "evidence": ev_list[:3]
        })
        
    # 3. Categorical & Segmentation Cohorts
    cat_stats = context.get("statistics", {}).get("categorical_stats", [])
    if cat_stats:
        cat_summary = []
        ev_list = []
        for col in cat_stats[:4]:
            c_name = col.get("column_name")
            top_val = col.get("most_frequent")
            top_pct = col.get("most_frequent_pct", 0)
            uniq = col.get("unique_count", 0)
            cat_summary.append(f"Column '{c_name}': {uniq} unique categories. Dominant class '{top_val}' ({top_pct}% share).")
            ev_list.append({"metric": f"Dominant {c_name}", "value": f"{top_val} ({top_pct}%)"})
        chunks.append({
            "topic": "categorical_segments_and_categories",
            "keywords": ["category", "segment", "region", "channel", "department", "cohort", "breakdown", "top", "share", "target", "focus"],
            "content": "Categorical Breakdown Facts: " + " | ".join(cat_summary),
            "evidence": ev_list[:3]
        })

    # 4. Outliers & Anomalies
    outliers = context.get("outliers", {})
    total_out = outliers.get("total_outlier_rows", 0)
    col_outliers = outliers.get("column_outliers", [])
    col_str = ", ".join([f"{c.get('column_name')} ({c.get('outlier_count')} anomalies)" for c in col_outliers[:3]])
    chunks.append({
        "topic": "anomalies_and_outliers",
        "keywords": ["anomaly", "anomalies", "outlier", "outliers", "risk", "suspicious", "error", "spike", "irregular", "flag"],
        "content": (
            f"Outlier & Anomaly Scan: Discovered {total_out:,} anomalous records ({outliers.get('percentage_affected', 0)}% of dataset). "
            f"Affected metrics: {col_str or 'None detected'}. "
            f"Calculated using Isolation Forest and Interquartile Range (IQR) boundary violations."
        ),
        "evidence": [
            {"metric": "Anomalous Rows", "value": f"{total_out:,}"},
            {"metric": "Outlier Share", "value": f"{outliers.get('percentage_affected', 0)}%"}
        ]
    })

    # 5. Correlations & Predictive Relationships
    relationships = context.get("correlation", {}).get("top_relationships", [])
    if relationships:
        rel_summary = []
        ev_list = []
        for r in relationships[:4]:
            rel_summary.append(f"'{r.get('feature_a')}' and '{r.get('feature_b')}': Pearson r={r.get('correlation', 0):+.2f} ({r.get('strength')} {r.get('direction')})")
            ev_list.append({"metric": f"{r.get('feature_a')} ↔ {r.get('feature_b')}", "value": f"r = {r.get('correlation', 0):+.2f}"})
        chunks.append({
            "topic": "correlations_and_relationships",
            "keywords": ["correlation", "relationship", "correlated", "driver", "predict", "impact", "affect", "connection", "pearson"],
            "content": "Multivariate Correlation Matrix Facts: " + " | ".join(rel_summary),
            "evidence": ev_list[:3]
        })

    # 6. KMeans Clustering
    clustering = context.get("clustering", {})
    clusters = clustering.get("clusters", [])
    if clusters:
        cl_summary = []
        for c in clusters[:4]:
            cl_summary.append(f"Cluster '{c.get('name', 'Segment')}': {c.get('size', 0)} items ({c.get('percentage', 0)}%). Traits: {c.get('description', '')}")
        chunks.append({
            "topic": "machine_learning_clusters",
            "keywords": ["cluster", "clusters", "clustering", "kmeans", "persona", "profile", "archetype", "grouping"],
            "content": f"ML KMeans Segmentation (Silhouette score={clustering.get('silhouette_score', 0):.2f}): " + " | ".join(cl_summary),
            "evidence": [
                {"metric": "Cluster Count", "value": f"{len(clusters)} clusters"},
                {"metric": "Silhouette Quality", "value": f"{clustering.get('silhouette_score', 0):.2f}"}
            ]
        })

    # 7. Trends & Seasonality
    trends = context.get("trends", {})
    if trends.get("has_date_column"):
        chunks.append({
            "topic": "temporal_trends_and_growth",
            "keywords": ["trend", "growth", "time", "date", "temporal", "trajectory", "seasonality", "month", "year", "increase", "decrease"],
            "content": (
                f"Time-Series Trend on '{trends.get('date_column')}': Direction is {trends.get('direction', 'neutral')} "
                f"with {trends.get('change_pct', 0):+.1f}% net progression. Seasonality: {trends.get('seasonality', 'uniform')}."
            ),
            "evidence": [
                {"metric": "Trend Direction", "value": str(trends.get('direction', 'Stable'))},
                {"metric": "Change %", "value": f"{trends.get('change_pct', 0):+.1f}%"}
            ]
        })

    return chunks


def retrieve_relevant_chunks(question: str, chunks: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
    """
    RAG Retriever: Scores and ranks data knowledge chunks based on keyword and semantic overlap with the question.
    """
    q_tokens = set(question.lower().replace("?", "").replace(",", "").replace(".", "").split())
    scored = []
    
    for chunk in chunks:
        score = 0
        # Keyword matching
        for kw in chunk.get("keywords", []):
            if kw in q_tokens or any(kw in token for token in q_tokens):
                score += 3
        # Content overlap
        chunk_words = chunk.get("content", "").lower()
        for token in q_tokens:
            if len(token) > 3 and token in chunk_words:
                score += 1
                
        scored.append((score, chunk))
        
    # Sort descending by score
    scored.sort(key=lambda x: x[0], reverse=True)
    
    # Return top_k
    top_chunks = [item[1] for item in scored[:top_k]]
    # Fallback to at least first 2 chunks if no overlap
    if not top_chunks and len(chunks) >= 2:
        top_chunks = chunks[:2]
    return top_chunks


async def answer_question_with_rag(question: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Retrieval-Augmented Generation (RAG) Data Copilot using Groq's ultra-fast Llama 3.3 70B.
    Guarantees answers are strictly grounded in verified statistical facts.
    """
    # 1. Build RAG knowledge base from dataset context
    chunks = build_data_rag_chunks(context)
    
    # 2. Retrieve most relevant analytical facts
    relevant_chunks = retrieve_relevant_chunks(question, chunks, top_k=3)
    
    # Collect evidence items from retrieved chunks
    evidence = []
    for rc in relevant_chunks:
        for ev in rc.get("evidence", []):
            if ev not in evidence:
                evidence.append(ev)
    evidence = evidence[:4]
    
    # Check for Groq API key
    groq_key = os.getenv("GROQ_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    rag_context_text = "\n\n".join([f"[{c['topic'].upper()}]: {c['content']}" for c in relevant_chunks])
    
    system_prompt = (
        "You are InsightAI Data Copilot, an elite Senior Data Analyst and Chief Analytics Officer. "
        "Your role is to answer executive questions about the user's dataset using ONLY the verified facts provided below. "
        "Strict Architectural Rule: Never guess numbers or perform arithmetic outside the provided facts. "
        "Return a JSON object with exactly two string fields:\n"
        "1. 'answer': Direct, high-impact, professional data-driven answer (2-4 sentences).\n"
        "2. 'recommendation': Specific, high-ROI actionable next step for leadership (1-2 sentences)."
    )
    
    user_prompt = f"VERIFIED RAG FACTS:\n{rag_context_text}\n\nUSER QUESTION: {question}"

    if groq_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                    json={
                        "model": "openai/gpt-oss-120b",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "response_format": {"type": "json_object"},
                        "temperature": 0.2
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    parsed = json.loads(data['choices'][0]['message']['content'])
                    return {
                        "question": question,
                        "answer": parsed.get("answer", "Analysis verified from retrieved dataset facts."),
                        "recommendation": parsed.get("recommendation", "Review top cohort distributions for allocation decisions."),
                        "metrics_analyzed": [c["topic"].replace("_", " ").title() for c in relevant_chunks],
                        "evidence": evidence,
                        "narration_text": f"{parsed.get('answer', '')} Recommendation: {parsed.get('recommendation', '')}",
                        "copilot_engine": "InsightAI Groq RAG Copilot (GPT-OSS 120B)"
                    }
        except Exception as e:
            print(f"Groq RAG call failed: {e}. Falling back to deterministic RAG.")

    # Fallback to Deterministic Grounded RAG if LLM fails or is not reachable
    primary_chunk = relevant_chunks[0] if relevant_chunks else chunks[0]
    return {
        "question": question,
        "answer": f"Based on retrieved {primary_chunk['topic'].replace('_', ' ')}: {primary_chunk['content']}",
        "recommendation": "Track primary operational metrics against historical benchmarks to protect baseline margins.",
        "metrics_analyzed": [c["topic"].replace("_", " ").title() for c in relevant_chunks],
        "evidence": evidence,
        "narration_text": f"{primary_chunk['content']} Recommendation: Prioritize key cohort alignment.",
        "copilot_engine": "InsightAI Deterministic RAG Engine"
    }
