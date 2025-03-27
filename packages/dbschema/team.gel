module team {
    type Team {
        required name: str;
        required tag: str {
            constraint exclusive;
        };
        required description: str;
        multi all_members := .<teams[is users::Rep];
        multi members := (
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
        # TODO team leads?
    }
}