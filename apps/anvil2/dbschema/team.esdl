module team {
    type Team {
        required name: str;
        required tag: str {
            constraint exclusive;
        };
        required description: str;
        multi all_members := (
            select users::Rep
            filter any(.teams.id = __source__.id)
        );
        multi members := (
            # with all_members := (  # would be nice to have but seemingly breaks the compiler
            #     select .all_members
            # )
            select .all_members
            filter (
                .status = users::RepStatus.ACTIVE
                and (
                    select not exists (
                        select __source__.all_members.teams@ends_at
                        filter __source__.all_members.teams.id = __source__.id
                    )
                )
            )
        );
    }
}