
update sign_in::SignIn set {
    _tools := distinct (
        for tool in array_unpack(.tools) union (
            if tool = "Unpowered Handtools" then
                (select tools::Tool filter .name = "Unpowered Hand Tools")
            else if tool = "Band Saw" then
                (select tools::GroupedTool filter .name = "Band Saw")
            else if tool = "Drill Bits and Cutting Speeds" then
                (select tools::GroupedTool filter .name = "Pillar Drill")
            else if tool = "Embroidery Machine Memory Craft 550E" then
                (select tools::Tool filter .name = "Embroidery Machine")
            else if tool = "Form 3 SLA Printer" then
                (select tools::GroupedTool filter .name = "SLA Printer")
            else if tool = "Hot Tools" then
                (select tools::Tool filter .name = "Electronics")
            else if tool in {"Induction", "Heartspace Induction", "Mainspace Induction", "Workshop health and safety and General Induction"} then
                (select tools::Tool filter .name = "Unpowered Hand Tools")
            else if tool = "Laser Cutter" then
                (select tools::GroupedTool filter .name = "Laser Cutter")
            else if tool = "Overlocker (Brother 2104D)" then
                (select tools::Tool filter .name = "Overlocker")
            else if tool = "Pillar Drill" then
                (select tools::GroupedTool filter .name = "Pillar Drill")
            else if tool = "SLA Printer" then
                (select tools::GroupedTool filter .name = "SLA Printer")
            else if tool = "Sanding Machines" then
                (select tools::GroupedTool filter .name = "Sanding Machines")
            else
                (select tools::Tool filter .name = tool)
        )
    )
}
