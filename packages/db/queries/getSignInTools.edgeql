with
    location := (
        select assert_exists(sign_in::Location filter .name = <sign_in::LocationName>$name)
    ),
    user := <users::User><uuid>$id,
    tools := (select tools::Tool filter location = .location and not .grouped),
    groups := (select tools::GroupedTool filter location = .location),
    supervisable_training := location.supervisable_training,
select (tools union groups) {
    id,
    name,
    description := [is tools::Tool].description ?? [is tools::GroupedTool].tools.description,
    compulsory := any(.training.compulsory),
    selectable := (
      with
        # inlined copy of training::get_status (training.gel), keep the two in sync
        collapse := <optional bool>$collapse,
        # get_status takes a single Training but .training is multi, so evaluate it once per training
        next_step := (for training in .training union (
            with
                module training,
                is_rep := user is users::Rep,
                collapse_ := collapse and is_rep,  # collapse_ should always be false for users
                # expires := get_expiry_dates(user),

                is_user_training := exists training.rep,
                u := user{training filter .id = training.id},  # stupid but you can't do training@created_at directly for some reason
                training_in_person_needed := training.in_person,
                training_online_done := exists u.training@created_at,
                training_in_person_done := exists u.training@in_person_created_at,
                # the presence of any revocation means they can't use it.
                training_revoked := exists u.training@infraction,
                training_expired := false, # datetime_of_statement() > <datetime>json_get(expires, <str>training.id),

                r := user{training filter .id = training.rep.id},
                rep_online := exists r.training@created_at,
                rep_in_person_needed := training.rep.in_person ?? false,
                rep_in_person_done := exists r.training@in_person_created_at,
                rep_revoked := exists r.training@infraction,
                rep_expired := false, # datetime_of_statement() > <datetime>json_get(expires, <str>training.rep.id),

                 key := (
                    select default::bin(
                        ("1" if training_in_person_needed else "0") ++
                        ("1" if rep_in_person_needed else "0") ++
                        ("1" if training_online_done else "0") ++
                        ("1" if training_in_person_done else "0") ++
                        ("1" if rep_online else "0") ++
                        ("1" if rep_in_person_done else "0") ++

                        ("1" if training_expired else "0") ++
                        ("1" if rep_expired else "0") ++
                        ("1" if training_revoked else "0") ++
                        ("1" if rep_revoked else "0")
                    ) if collapse_
                    else default::bin(
                        ("1" if training_in_person_needed else "0") ++
                        ("1" if training_online_done else "0") ++
                        ("1" if training_in_person_done else "0") ++
                        ("1" if training_expired else "0") ++
                        ("1" if training_revoked else "0")
                    )
                ),
                lookups := global COLLAPSED_LOOKUPS if collapse_ else global LOOKUPS,
                select (
                     if not collapse_ or is_user_training then
                        (# assert_exists(  # TODO add this back at some point once I've fixed people's invalid training records
                            select lookups
                            filter bit_and(key, .care) = .value
                            order by .value desc  # more specific ones first
                            limit 1
                        )
                    else
                        {}
                )
        )).next_step
      select {
        # TODO in future not booked
        tools::Selectability.NONE_REMAINING if [is tools::Tool].quantity = 0 else <tools::Selectability>{},  # inventoried tools cannot be grouped
        if [is tools::Tool] is tools::Tool then  # cursed ass logic
          if [is tools::Tool].status.code = tools::Status.OUT_OF_ORDER then
            tools::Selectability.TOOL_BROKEN
          else
            <tools::Selectability>{}
        else
          if all([is tools::GroupedTool].tools.status.code = tools::Status.OUT_OF_ORDER) then
            tools::Selectability.TOOL_BROKEN
          else
            <tools::Selectability>{},
        <tools::Selectability><str>next_step if next_step != training::NextStep.NONE else <tools::Selectability>{},
        # if they're a rep they can sign in to use the machines they want even if the reps aren't trained
        if .training not in supervisable_training and user is not users::Rep then
          tools::Selectability.REPS_UNTRAINED
        else
          <tools::Selectability>{},
    })
}