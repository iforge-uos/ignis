select team::Team {
    id,
    name,
    score := ext::pg_trgm::word_similarity(<str>$query, .name),
}
filter .score > 0.3
order by .score desc
limit <int16>$limit;
