with training := <training::Training><uuid>$id,
select training {
    **,
    sections: {
        *,
        type_name := .__type__.name,
        [is training::Page].name,
        duration_ := duration_to_seconds([is training::Page].duration),
        answers := [is training::Question].answers {
            id,
            content,
            description,
        },
    }
}