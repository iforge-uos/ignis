with res := (
  select fts::search(notification::MailingList, <str>$query, language := 'eng')
)
select res.object {
    id,
    name,
    score := res.score,
}
order by res.score desc
limit <int16>$limit;
