with
    rep := <users::Rep><uuid>$rep_id,
    user := <users::User><uuid>$id,
update user
set {
    training := (
        select .training {
            @in_person_created_at := <datetime>$created_at,
            @in_person_signed_off_by := rep.id,
        } filter .id =  <uuid>$training_id
    )
}