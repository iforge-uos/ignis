select assert_exists(
    training::Training {
        **,
        sections: {
            *,
            type_name := .__type__.name,
            [is training::TrainingPage].name,
            duration_ := duration_to_seconds([is training::TrainingPage].duration),
            answers := [is training::Question].answers {
                id,
                content,
                description,
            },
        }
    }
    filter .id = <uuid>$id
)