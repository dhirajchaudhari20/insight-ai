export function generateReportMarkdown(data) {
  if (!data) return '';

  const { overview, cleaning_report, statistics, correlation, outliers, clustering, trends, ai_insights } = data;

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `# InsightAI Analysis Report: ${overview?.filename || 'Dataset'}
**Generated on:** ${dateStr}
**Overall Data Quality Score:** ${cleaning_report?.quality_score || 0}/100

---

## 1. Executive Summary
${ai_insights?.executive_summary || 'N/A'}

---

## 2. Dataset Overview
- **Analyzed Records:** ${overview?.total_rows?.toLocaleString()} (Original: ${cleaning_report?.original_rows?.toLocaleString()})
- **Total Columns:** ${overview?.total_columns} (${overview?.numeric_columns} Numeric, ${overview?.categorical_columns} Categorical, ${overview?.date_columns} Date, ${overview?.text_columns} Text)
- **Duplicate Rows Removed:** ${cleaning_report?.initial_duplicates || 0}
- **Missing Values Handled:** ${cleaning_report?.missing_values_handled || 0}

### Cleaning Actions Performed:
${(cleaning_report?.actions || []).map(a => `- ${a}`).join('\n')}

---

## 3. Top Key Insights (Evidence-Backed)
${(ai_insights?.key_insights || []).map((ki, i) => `### ${i + 1}. ${ki.title}
${ki.insight}
*Evidence:* \`${ki.evidence}\`
`).join('\n')}

---

## 4. Statistical Analysis Summary
### Numeric Attributes
| Metric | Mean | Median | Min | Max | Std Dev |
|---|---|---|---|---|---|
${(statistics?.numeric_stats || []).map(s => `| ${s.column_name} | ${s.mean} | ${s.median} | ${s.min} | ${s.max} | ${s.std} |`).join('\n')}

### Categorical Attributes
${(statistics?.categorical_stats || []).map(c => `- **${c.column_name}**: Top value is '${c.most_frequent}' with ${c.most_frequent_count} records (${c.most_frequent_pct}% share across ${c.unique_count} distinct categories)`).join('\n')}

---

## 5. Correlations & Statistical Relationships
${(correlation?.top_relationships || []).map(r => `- **${r.feature_a} & ${r.feature_b}**: ${r.strength} ${r.direction} relationship (Pearson r = ${r.correlation > 0 ? '+' : ''}${r.correlation}). *${r.description}*`).join('\n')}

---

## 6. Outlier & Anomaly Detection
- **Total Records Flagged as Outliers:** ${outliers?.total_outlier_rows || 0} (${outliers?.percentage_affected || 0}%)
- **Affected Attributes:** ${outliers?.affected_columns_count || 0}
${(outliers?.column_outliers || []).map(o => `- **${o.column_name}**: ${o.outlier_count} potential outliers outside [${o.lower_bound}, ${o.upper_bound}]`).join('\n')}

---

## 7. Machine Learning Segmentation
${clustering?.is_applicable ? `
- **Clusters Formed:** ${clustering.clusters_count}
- **Validation Score:** Silhouette = ${clustering.silhouette_score}
- **Features Used:** ${clustering.features_used.join(', ')}

${clustering.clusters.map(c => `- **${c.name}**: ${c.percentage}% of records (${c.size} observations) - *${c.characteristics}*`).join('\n')}
` : `- ${clustering?.message || 'Clustering was not suitable for this dataset.'}`}

---

## 8. Strategic Business Recommendations
${(ai_insights?.recommendations || []).map(rec => `- **[${rec.priority} Priority - ${rec.category}]**: ${rec.action}`).join('\n')}

---
*Report automatically synthesized by InsightAI — Automated Data Analyst.*
`;
}

export function downloadReportFile(data) {
  const content = generateReportMarkdown(data);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `InsightAI_Report_${(data?.overview?.filename || 'dataset').replace(/\.[^/.]+$/, "")}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
