with
    training := <training::Training><uuid>$id,
    session := (
        insert training::Session {
            training := training,
            user := global default::user,
        }
        # return the current session if the user has one
        unless conflict on ((.user, .training)) # must be kept in-line with Session constraint
        else (select training::Session)
    ),
select assert_exists(session {
    id,
    sections := (
        select session.training.sections {
            # Section
            type_name := .__type__.name,
            id,
            index,
            content,
            [is training::Page].name,
            [is training::Page].duration,
            [is training::Question].type,
            [is training::Question].answers: {
                id,
                content,
                correct,
            },
        }
        filter .enabled and .index <= session.index
        order by .index
    )
});