with training := (
    select assert_exists(training::Training filter .id = <uuid>$id)
),
user := (
    select global default::user
),
session := (
    insert training::Session {
        training := training,
        user := (
            user if exists training.rep
            else (
                user if user is users::Rep else <users::User>{}  # intentionally invalid value
            )
        ),
    }
    # return the current session if the user has one
    unless conflict on ((.user, .training)) # must be kept in-line with Session constraint
    else (select training::Session)
),
select session {
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
            answers := [is training::Question].answers {
                id,
                content,
            },
        }
        filter .enabled and .index <= session.index
        order by .index
    )
};