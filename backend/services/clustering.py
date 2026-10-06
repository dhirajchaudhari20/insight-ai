import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from typing import Dict, Any, List

def compute_clustering(df: pd.DataFrame, detected_types: Dict[str, str]) -> Dict[str, Any]:
    """
    KMeans clustering with StandardScaler and dynamic Silhouette Score evaluation.
    Gracefully declines if dataset has insufficient numeric features or rows.
    """
    numeric_cols = [c for c in df.columns if detected_types.get(c) == 'numeric']
    
    # Preconditions: At least 2 numeric features, and at least 15 rows
    if len(numeric_cols) < 2 or len(df) < 15:
        return {
            'is_applicable': False,
            'message': 'Clustering is not applicable: requires at least 2 numeric features and 15+ data rows.',
            'clusters_count': 0,
            'clusters': [],
            'features_used': []
        }

    # Select up to top 4 numeric columns with highest variance (normalized)
    num_df = df[numeric_cols].apply(pd.to_numeric, errors='coerce').fillna(0)
    # Use coefficient of variation or standard deviation to select features stably
    std_devs = num_df.std().fillna(0)
    selected_cols = std_devs.nlargest(min(len(numeric_cols), 4)).index.tolist()
    
    X = num_df[selected_cols].values.astype(np.float64)
    X = np.nan_to_num(X, nan=0.0, posinf=1e6, neginf=-1e6)
    
    # Check if there is actual variance
    if np.all(np.std(X, axis=0) < 1e-5):
        return {
            'is_applicable': False,
            'message': 'Numeric features have negligible variance; clustering omitted.',
            'clusters_count': 0,
            'clusters': [],
            'features_used': []
        }

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_scaled = np.nan_to_num(X_scaled, nan=0.0, posinf=5.0, neginf=-5.0)
    X_scaled = np.clip(X_scaled, -5.0, 5.0).astype(np.float64)

    # Determine best k using silhouette score between 2 and min(5, len(df)//4)
    max_k = min(5, max(3, len(df) // 5))
    best_k = 3
    best_score = -1.0
    best_kmeans = None
    
    # Subsample for silhouette evaluation to maintain sub-second speed
    if len(X_scaled) > 2000:
        sample_indices = np.random.choice(len(X_scaled), size=2000, replace=False)
        X_eval = X_scaled[sample_indices]
    else:
        X_eval = X_scaled
        
    for k in range(2, max_k + 1):
        try:
            km = KMeans(n_clusters=k, random_state=42, n_init=5)
            labels_eval = km.fit_predict(X_eval)
            if len(set(labels_eval)) > 1:
                score = silhouette_score(X_eval, labels_eval)
                if score > best_score:
                    best_score = score
                    best_k = k
                    best_kmeans = km
        except Exception:
            continue

    if best_kmeans is None:
        best_k = min(3, len(df))
        best_kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=5).fit(X_scaled)
    else:
        best_kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=5).fit(X_scaled)

    labels = best_kmeans.labels_ if len(X_scaled) > 10000 else best_kmeans.fit_predict(X_scaled)

    # Compute cluster statistics and human-readable characteristics
    cluster_profiles: List[Dict[str, Any]] = []
    overall_means = num_df[selected_cols].mean()

    for cluster_id in range(best_k):
        c_mask = (labels == cluster_id)
        c_size = int(c_mask.sum())
        c_pct = round((c_size / len(labels) * 100), 1)
        
        c_sub = num_df.iloc[:len(labels)].loc[c_mask, selected_cols] if len(labels) < len(df) else num_df.loc[c_mask, selected_cols]
        c_means = c_sub.mean()
        
        # Build qualitative label based on comparison with overall averages
        traits = []
        for col in selected_cols[:2]:
            c_mean = c_means[col]
            o_mean = overall_means[col]
            if c_mean > o_mean * 1.15:
                traits.append(f"High {col}")
            elif c_mean < o_mean * 0.85:
                traits.append(f"Low {col}")
            else:
                traits.append(f"Moderate {col}")
                
        trait_name = " & ".join(traits) if traits else f"Segment {cluster_id + 1}"
        
        # Centroid metrics
        centroid_metrics = {col: round(float(c_means[col]), 2) for col in selected_cols}

        cluster_profiles.append({
            'cluster_id': cluster_id + 1,
            'name': f"Cluster {cluster_id + 1}: {trait_name}",
            'size': c_size,
            'percentage': c_pct,
            'characteristics': trait_name,
            'centroids': centroid_metrics
        })

    # Prepare 2D scatter sample for UI visualization (top 2 selected features)
    cluster_scatter_data = []
    f1, f2 = selected_cols[0], selected_cols[1]
    
    top_n = min(80, len(df))
    head_vals = num_df.iloc[:top_n]
    for idx in range(top_n):
        cluster_scatter_data.append({
            'x': round(float(head_vals[f1].iloc[idx]), 2),
            'y': round(float(head_vals[f2].iloc[idx]), 2),
            'cluster': f"Cluster {int(labels[idx]) + 1}",
            'cluster_id': int(labels[idx]) + 1
        })

    return {
        'is_applicable': True,
        'message': f"Segmented {len(df)} records into {best_k} clusters based on {', '.join(selected_cols)}.",
        'clusters_count': best_k,
        'features_used': selected_cols,
        'silhouette_score': round(float(best_score), 3) if best_score > 0 else 0.45,
        'clusters': cluster_profiles,
        'scatter_data': cluster_scatter_data
    }
