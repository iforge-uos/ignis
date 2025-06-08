with user := (
    delete users::User filter .id = <uuid>$id
),


select user{**}