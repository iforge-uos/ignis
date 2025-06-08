
with
    user := <users::User><uuid>$id,
    infraction := (
        insert users::Infraction {
            user := user,
            reason := <str>$reason,
            resolved := true,
            type := users::InfractionType.TRAINING_ISSUE,
        }
    ),
update user
set {
    training += (
        select .training {
            @created_at := @created_at,
            @infraction := infraction.id,
            @in_person_created_at := @in_person_created_at,
            @in_person_signed_off_by := @in_person_signed_off_by,
        } filter .id =  <uuid>$training_id
    )
}