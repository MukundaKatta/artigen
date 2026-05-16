CREATE MATERIALIZED VIEW IF NOT EXISTS trending_prompts AS
SELECT
  am.prompt,
  am.model_id,
  am.model_name,
  array_agg(DISTINCT unnest_tag) AS style_tags,
  COUNT(*) AS use_count,
  SUM(p.likes_count) AS total_likes,
  MAX(p.created_at) AS last_used_at
FROM ai_metadata am
JOIN posts p ON p.id = am.post_id
LEFT JOIN LATERAL unnest(am.style_tags) AS unnest_tag ON true
WHERE p.created_at > now() - interval '7 days'
  AND p.is_archived = false
GROUP BY am.prompt, am.model_id, am.model_name
HAVING COUNT(*) >= 2
ORDER BY use_count DESC, total_likes DESC;

CREATE UNIQUE INDEX idx_trending_prompts_prompt ON trending_prompts(prompt, model_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS trending_styles AS
SELECT
  unnest_tag AS style,
  COUNT(*) AS post_count,
  SUM(p.likes_count) AS total_likes
FROM ai_metadata am
JOIN posts p ON p.id = am.post_id
CROSS JOIN LATERAL unnest(am.style_tags) AS unnest_tag
WHERE p.created_at > now() - interval '7 days'
  AND p.is_archived = false
GROUP BY unnest_tag
ORDER BY post_count DESC;

CREATE OR REPLACE FUNCTION refresh_trending() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY trending_prompts;
  REFRESH MATERIALIZED VIEW CONCURRENTLY trending_styles;
END;
$$ LANGUAGE plpgsql;
