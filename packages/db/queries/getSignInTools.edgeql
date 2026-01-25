with
    location := (
        select assert_exists(sign_in::Location filter .name = <sign_in::LocationName>$name)
    ),
    user := assert_exists(<users::User><uuid>$id),
    tools := (select tools::Tool filter location = .location and not .grouped),
    groups := (select tools::GroupedTool filter location = .location)
select (tools union groups) {
    name,
    description := [is tools::Tool].description ?? [is tools::GroupedTool].tools.description,
    selectable := (
      with
        next_step := training::get_status(.training, user).next_step
      select {
        # TODO in future not booked
        tools::Selectability.NONE_REMAINING if [is tools::Tool].quantity = 0 else <tools::Selectability>{},  # inventoried tools cannot be grouped
        if [is tools::Tool] is tools::Tool then  # cursed ass logic
          if [is tools::Tool].status.code = tools::Status.OUT_OF_ORDER then
            tools::Selectability.TOOL_BROKEN
          else
            <tools::Selectability>{}
        else
          if all([is tools::GroupedTool].tools.status = tools::Status.OUT_OF_ORDER) then
            tools::Selectability.TOOL_BROKEN
          else
            <tools::Selectability>{},
        <tools::Selectability><str>next_step if next_step != training::NextStep.NONE else <tools::Selectability>{},
        # if they're a rep they can sign in to use the machines they want even if the reps aren't trained
        tools::Selectability.REPS_UNTRAINED if .training not in location.supervisable_training else <tools::Selectability>{},
    })
}