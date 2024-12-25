with users := (
    select users::User {
        similarty := ext::pg_trgm::word_similarity(
            <str>$query,
            (
                "000" ++ to_str(.ucard_number) ++ " " ++
                .username ++ " " ++
                .email ++ " " ++
                .display_name
            )
        )
    }
    filter .similarty > 0.3
    order by .similarty desc
    limit max({min({<int64>$limit, 100}), 1})
),
select users {
    id,
    pronouns,
    email,
    display_name,
    username,
    ucard_number,
    profile_picture,
    created_at,
    roles: {
        id,
        name,
    },
}