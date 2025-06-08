with training := <training::Training><uuid>$id,
select training {
    **,
    sections: {
        *,
        type_name := .__type__.name,
        [is training::Page].name,
        [is training::Page].duration,
        [is training::Question].answers: {
            id,
            content,
            description,
        },
    }
}