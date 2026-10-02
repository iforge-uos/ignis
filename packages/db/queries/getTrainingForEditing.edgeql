with training := <training::Training><uuid>$id,
select training {
    **,
    sections: {
        *,
        type_name := .__type__.name,
        [is training::TrainingPage].name,
        [is training::TrainingPage].duration,
        [is training::Question].answers: {
            id,
            content,
            description,
        },
    }
}