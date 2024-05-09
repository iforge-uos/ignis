with list := (  # get the on-shift reps
    select sign_in::List
    filter (
        .location = <sign_in::SignInLocation>$location
        and .sign_ins.reason.name in array_unpack(<array<str>>$on_shift_reasons)
        and .sign_ins.user is users::Rep  # this is the reason this file is needed, the is operator isn't supported yet
    )
),
rep_training := (  # get the on-shift trainings
    select list.sign_ins.user.training
    # filter (
    #     <training::TrainingLocation>$location_ in .locations
    #     and not exists .rep
    # )
),
# user_training := (  # get the user's trainings
select assert_exists(
    users::User{
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
            @created_at,
            @in_person_created_at,
            expired := assert_exists((@created_at + .expires_after) < datetime_of_statement()) if exists .expires_after else false,
            selectable := (users::User is users::Rep or .rep.id in rep_training.id) and (.in_person and exists @in_person_created_at),
        } filter exists .rep and <training::TrainingLocation>$location_ in .locations
        # if they're a rep they can sign in off shift to use the machines they want even if the reps aren't trained
        # ideally first comparison should be `__source__ is users::Rep`
    }
    filter .id = <uuid>$id
)
# )
# select (
#     select distinct (  # ideally this should be applied though EDB can't seem to return the full objects with variable access so we must handle this in TS
#         select training::Training  # TODO reduce the amount of data transferred by storing this similiar to sign in reasons
#         filter .id not in user_training.id and exists .rep and <training::TrainingLocation>$location_ in .locations
#     ) union user_training.training
# );