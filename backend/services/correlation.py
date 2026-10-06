import pandas as pd
import numpy as np
from typing import Dict, Any, List

def compute_correlation_analysis(df: pd.DataFrame, detected_types: Dict[str, str]) -> Dict[str, Any]:
    """
    Computes Pearson correlation matrix and ranks strongest non-trivial relationships.
    Strictly avoids causal claims.
    """
    numeric_cols = [c for c in df.columns if detected_types.get(c) == 'numeric']
    
    if len(numeric_cols) < 2:
        return {
            'is_applicable': False,
            'message': 'Correlation analysis requires at least two numeric columns.',
            'matrix': {},
            'columns': [],
            'heatmap_data': [],
            'top_relationships': []
        }
        
    # Convert numeric columns to float, dropping NaNs
    num_df = df[numeric_cols].apply(pd.to_numeric, errors='coerce')
    
    # Filter out zero-variance columns (constant values)
    active_numeric_cols = [c for c in numeric_cols if num_df[c].std() > 1e-8]
    
    if len(active_numeric_cols) < 2:
        return {
            'is_applicable': False,
            'message': 'Not enough variance among numeric columns to compute meaningful correlations.',
            'matrix': {},
            'columns': [],
            'heatmap_data': [],
            'top_relationships': []
        }
        
    corr_matrix = num_df[active_numeric_cols].corr().fillna(0)
    
    # Format matrix for UI heatmap
    heatmap_data: List[Dict[str, Any]] = []
    matrix_dict: Dict[str, Dict[str, float]] = {}
    
    for c1 in active_numeric_cols:
        matrix_dict[c1] = {}
        for c2 in active_numeric_cols:
            val = round(float(corr_matrix.loc[c1, c2]), 2)
            matrix_dict[c1][c2] = val
            heatmap_data.append({
                'x': c1,
                'y': c2,
                'value': val
            })
            
    # Extract unique pairs and rank relationships
    relationships: List[Dict[str, Any]] = []
    seen_pairs = set()
    
    for i, c1 in enumerate(active_numeric_cols):
        for j, c2 in enumerate(active_numeric_cols):
            if i < j:
                val = float(corr_matrix.loc[c1, c2])
                abs_val = abs(val)
                pair_key = tuple(sorted([c1, c2]))
                if pair_key not in seen_pairs:
                    seen_pairs.add(pair_key)
                    
                    # Qualitative categorization (non-causal)
                    if abs_val >= 0.70:
                        strength = "Strong"
                    elif abs_val >= 0.40:
                        strength = "Moderate"
                    elif abs_val >= 0.20:
                        strength = "Weak"
                    else:
                        strength = "Negligible"
                        
                    direction = "positive" if val > 0 else "inverse"
                    desc = f"{c1} and {c2} exhibit a {strength.lower()} {direction} statistical relationship (r = {val:+.2f})."
                    
                    relationships.append({
                        'feature_a': c1,
                        'feature_b': c2,
                        'correlation': round(val, 2),
                        'abs_correlation': round(abs_val, 2),
                        'strength': strength,
                        'direction': direction,
                        'description': desc
                    })
                    
    # Sort by absolute correlation descending
    relationships.sort(key=lambda x: x['abs_correlation'], reverse=True)
    top_relationships = relationships[:6]
    
    return {
        'is_applicable': True,
        'message': f"Computed correlation across {len(active_numeric_cols)} numeric attributes.",
        'columns': active_numeric_cols,
        'matrix': matrix_dict,
        'heatmap_data': heatmap_data,
        'top_relationships': top_relationships
    }
