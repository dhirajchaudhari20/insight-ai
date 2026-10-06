import pandas as pd
from typing import Tuple, Optional
import os

def load_dataset_from_path(file_path: str, filename: str) -> Tuple[pd.DataFrame, Optional[str]]:
    """
    Safely load CSV or Excel data from disk using PyArrow.
    For multi-GB scale and sub-second ingestion, we sample the first 10,000 rows
    for the instant dashboard profiling. The full file remains on disk for DuckDB queries.
    """
    try:
        lower_name = filename.lower()
        if lower_name.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path, engine='openpyxl', nrows=10000)
        elif lower_name.endswith('.csv') or lower_name.endswith('.txt'):
            # 1. Try ultra-fast PyArrow C++ engine with limit
            try:
                df = pd.read_csv(file_path, engine='pyarrow', nrows=10000)
            except Exception:
                # 2. Fast C engine fallback
                try:
                    df = pd.read_csv(file_path, engine='c', encoding='utf-8', nrows=10000)
                except Exception:
                    try:
                        df = pd.read_csv(file_path, engine='c', encoding='latin1', nrows=10000)
                    except Exception:
                        df = pd.read_csv(file_path, sep=None, engine='python', nrows=10000)
        else:
            return pd.DataFrame(), f"Unsupported file type for '{filename}'. Please upload a CSV or XLSX file."

        if df.empty:
            return df, "The uploaded dataset is empty."
        
        if df.shape[1] == 0:
            return df, "The uploaded dataset contains no columns."

        # Strip whitespace from column names
        df.columns = [str(c).strip() for c in df.columns]
        return df, None
    except Exception as e:
        return pd.DataFrame(), f"Failed to parse file: {str(e)}"
