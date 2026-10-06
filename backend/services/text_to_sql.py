import os
import json
import time
import re
import duckdb
import httpx
import pandas as pd
from typing import Dict, Any, List, Optional

def sanitize_sql(raw_sql: str) -> str:
    """
    Cleans up the SQL string from markdown or commentary.
    Ensures it only runs read-only SELECT queries on 'dataset'.
    """
    cleaned = raw_sql.strip()
    # Remove markdown code blocks if present
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:sql)?", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"```$", "", cleaned)
        cleaned = cleaned.strip()

    # Safety checks: Prevent destructive statements
    forbidden = ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE", "ATTACH", "COPY", "EXPORT", "IMPORT"]
    for word in forbidden:
        if re.search(rf"\b{word}\b", cleaned, re.IGNORECASE):
            raise ValueError(f"Dangerous or non-read-only operation '{word}' is forbidden.")

    if not cleaned.lower().startswith("select"):
        raise ValueError("Query must be a SELECT statement.")

    return cleaned


async def generate_sql_from_natural_language(
    user_query: str,
    columns_info: List[Dict[str, Any]],
    sample_rows: List[Dict[str, Any]],
    dataset_name: str = "dataset"
) -> str:
    """
    Uses Groq (openai/gpt-oss-120b) to translate natural language into a clean DuckDB SQL query.
    """
    groq_key = os.getenv("GROQ_API_KEY")

    # Construct schema definition
    schema_cols = [f"{c.get('column_name')} ({c.get('detected_type', 'VARCHAR')})" for c in columns_info[:25]]
    schema_str = ", ".join(schema_cols)
    sample_str = json.dumps(sample_rows[:3], default=str)

    system_prompt = (
        f"You are an expert DuckDB SQL engineer. Your task is to translate user natural language requests "
        f"into a single, clean DuckDB SQL query over a table named '{dataset_name}'.\n"
        f"Table Schema: {schema_str}\n"
        f"Sample Records: {sample_str}\n\n"
        f"Rules:\n"
        f"1. Output ONLY the raw SQL query. Do NOT add markdown, explanations, or backticks.\n"
        f"2. Only use SELECT queries.\n"
        f"3. Quote column names with double quotes if they contain spaces or special characters (e.g. \"Total Amount\").\n"
        f"4. Apply sensible LIMIT 100 if no explicit limit is requested."
    )

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
                            {"role": "user", "content": f"User Request: {user_query}"}
                        ],
                        "temperature": 0.1
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    raw_sql = data['choices'][0]['message']['content'].strip()
                    return sanitize_sql(raw_sql)
        except Exception as e:
            print(f"Groq Text-to-SQL generation failed: {e}. Falling back to heuristic query.")

    # Rule-engine heuristic fallback
    q_lower = user_query.lower()
    first_num = next((c['column_name'] for c in columns_info if c.get('detected_type') == 'numeric'), None)
    first_cat = next((c['column_name'] for c in columns_info if c.get('detected_type') == 'categorical'), None)

    if "top" in q_lower or "highest" in q_lower:
        order_col = f'"{first_num}"' if first_num else '*'
        return f"SELECT * FROM {dataset_name} ORDER BY {order_col} DESC LIMIT 20"
    elif "average" in q_lower or "mean" in q_lower:
        if first_cat and first_num:
            return f"SELECT \"{first_cat}\", ROUND(AVG(\"{first_num}\"), 2) AS avg_value, COUNT(*) AS count FROM {dataset_name} GROUP BY \"{first_cat}\" ORDER BY avg_value DESC"
        elif first_num:
            return f"SELECT ROUND(AVG(\"{first_num}\"), 2) AS average_metric FROM {dataset_name}"
    
    return f"SELECT * FROM {dataset_name} LIMIT 50"


def execute_duckdb_query(df: pd.DataFrame, sql_query: str, original_file_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes a sanitized DuckDB query. If the original GB file path is available,
    queries the full disk file directly. Otherwise, registers the in-memory pandas DataFrame.
    """
    start_time = time.perf_counter()
    con = duckdb.connect(database=":memory:")
    try:
        if original_file_path and os.path.exists(original_file_path):
            # For massive GB files, rewrite FROM dataset to FROM read_csv_auto('path')
            # or register it as a view
            con.execute(f"CREATE VIEW dataset AS SELECT * FROM read_csv_auto('{original_file_path}')")
        else:
            # Register dataframe as virtual table 'dataset' for small files
            con.register("dataset", df)
            
        result_df = con.execute(sql_query).df()
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Convert records to JSON-serializable list
        records = result_df.head(200).fillna("").to_dict(orient="records")
        columns = list(result_df.columns)
        total_matched = len(result_df)

        return {
            "success": True,
            "sql_query": sql_query,
            "columns": columns,
            "rows": records,
            "total_matched_rows": total_matched,
            "execution_time_ms": elapsed_ms,
            "engine": "DuckDB In-Memory OLAP Vector Engine"
        }
    except Exception as e:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "success": False,
            "sql_query": sql_query,
            "error": str(e),
            "execution_time_ms": elapsed_ms
        }
    finally:
        con.close()
