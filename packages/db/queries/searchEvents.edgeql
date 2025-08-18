with res := (
  select fts::search(event::Event, <str>$query, language := 'eng')
)
select res.object {
    id,
    name,
    score := res.score,
}
order by res.score desc
limit <int16>$limit;
