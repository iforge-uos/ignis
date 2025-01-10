select assert_exists(
    training::Training {
        **,
        sections: {
            *,
            type_name := .__type__.name,
            [is training::Page].name,
            [is training::Page].duration,
            answers := [is training::Question].answers {
                id,
                content,
                description,
            },
        }
    }
    filter .id = <uuid>$id
)