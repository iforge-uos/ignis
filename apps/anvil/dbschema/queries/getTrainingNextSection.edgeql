with training := (
    select assert_exists(training::Training filter .id = <uuid>$id)
),
next_section := (
    select training.sections
    filter .enabled and .index > <int16>$session_index
    order by .index
    limit 1
),
select assert_single(
    next_section {
        type_name := .__type__.name,
        id,
        index,
        content,
        name := [is training::Page].name,
        duration_ := duration_to_seconds([is training::Page].duration),
        type := [is training::Question].type,
        answers := [is training::Question].answers {
            id,
            content,
        },
    }
);