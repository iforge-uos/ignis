with location := (
    select assert_exists(sign_in::Location filter .name = <sign_in::LocationName>$name)
),
select assert_exists(
    users::User {
        training: {
            id,
            name,
            compulsory,
            in_person,
            description,
            rep: {
              id,
              description,
            },
            enabled,
            icon_url,
            @created_at,
            @in_person_created_at,

            selectable := (select {
                training::Selectability.REVOKED if exists @infraction else <training::Selectability>{},
                training::Selectability.EXPIRED if (
                    exists .expires_after and @created_at + .expires_after > datetime_of_statement()
                ) else <training::Selectability>{},
                # if they're a rep they can sign in to use the machines they want even if the reps aren't trained
                training::Selectability.REPS_UNTRAINED if (
                    # TODO is this bugged
                    .id not in location.supervisable_training.id if users::User is not users::Rep else true,
                ) else <training::Selectability>{},
                training::Selectability.IN_PERSON_MISSING if .in_person and not exists @in_person_created_at else <training::Selectability>{},
            })
        }
        filter exists .rep and <training::LocationName>$name_ in .locations
    }
    filter .id = <uuid>$id
)