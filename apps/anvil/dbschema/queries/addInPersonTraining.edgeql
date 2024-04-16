with rep := (
    select users::Rep
    filter .id = <uuid>$rep_id
),
user := (
    update users::User
    filter .id = <uuid>$id
    set {
        training += (
            select .training {
                @created_at := @created_at,
                @in_person_created_at := <datetime>$created_at,
                @in_person_signed_off_by := assert_exists(rep.id),
            }
            filter .id = <uuid>$training_id
        )
    }
)
select assert_exists(user);
