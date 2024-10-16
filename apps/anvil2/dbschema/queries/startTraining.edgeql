with training := (
    select assert_exists(training::Training filter .id = <uuid>$id)
),
user := (
    select assert_exists(users::User filter .id = <uuid>$user_id)
),
session := (
    insert training::UserTrainingSession {
        training := training,
        user := (
            user if exists training.rep
            else (
                user if user is users::Rep else <users::User>{}  # intentionally invalid value
            )
        ),
    }
    # return the current session if the user has one
    unless conflict on ((.user, .training)) # must be kept in-line with UserTrainingSession constraint
    else (select training::UserTrainingSession)
),
select session {
    id,
    sections := (
        select session.training.sections {
            # TrainingSection
            type_name := .__type__.name,
            id,
            index,
            content,
            name := [is training::TrainingPage].name,
            duration_ := duration_to_seconds([is training::TrainingPage].duration),
            type := [is training::Question].type,
            answers := [is training::Question].answers {
                id,
                content,
            },
        }
        filter .enabled and .index <= session.index
        order by .index
    )
};