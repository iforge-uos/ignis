with
    MS := <sign_in::Location><uuid>"8f6bc6ca-3624-11ef-a0a2-375e24db936c",
    HS := <sign_in::Location><uuid>"8f7310ba-3624-11ef-a0a2-63dc43f65769"
select {
  # Band Saws (Mainspace)
  (insert tools::GroupedTool {
    name := "Band Saws",
    location := MS,
    training := (select training::Training filter .name = "Band Saw" and exists .rep),
    tools := {
      (insert tools::Tool {
        name := "Wood Band Saw",
        description := "Used for cutting wood, acrylic and other plastics.",
        responsible_reps := (select users::Rep filter .email = "mtroc1"),
        training := (select training::Training filter .name = "Band Saw" and exists .rep),
        rep := ((select training::Training filter .name = "Band Saw" and exists .rep).rep),
        location := MS,
        status := (code := tools::Status.NOMINAL, reason := ""),
        is_bookable := false,
        quantity := 1,
        borrowable := false,
        grouped := true,
      }),
      (insert tools::Tool {
        name := "Metal Band Saw",
        description := "This tool is used for cutting thin metal sheets or rods.",
        responsible_reps := (select users::Rep filter .email = "mtroc1"),
        training := (select training::Training filter .name = "Band Saw" and exists .rep),
        rep := ((select training::Training filter .name = "Band Saw" and exists .rep).rep),
        location := MS,
        status := (code := tools::Status.NOMINAL, reason := ""),
        is_bookable := false,
        quantity := 1,
        borrowable := false,
        grouped := true,
      }),
    },
  }),
  # Calipers (Mainspace)
  (insert tools::Tool {
    name := "Calipers",
    description := "Used for measuring small distances with high accuracy.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Mainspace Induction" and exists .rep),
    rep := ((select training::Training filter .name = "Mainspace Induction" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,  # TODO
    borrowable := true
  }),
  # USB Stick (Mainspace)
  (insert tools::Tool {
    name := "USB Stick",
    description := "Used for transferring data from your device to one ours.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Mainspace Induction" and exists .rep),
    rep := ((select training::Training filter .name = "Mainspace Induction" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1, # TODO
    borrowable := true
  }),
  # Breadboard (Mainspace)
  (insert tools::Tool {
    name := "Breadboard",
    description := "Used for prototyping electronic circuits.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Mainspace Induction" and exists .rep),
    rep := ((select training::Training filter .name = "Mainspace Induction" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1, # TODO
    borrowable := true
  }),
  # Scroll Saw (Mainspace)
  (insert tools::Tool {
    name := "Scroll Saw",
    description := "A saw used for cutting intricate curves and patterns in wood and other materials.",
    responsible_reps := (select users::Rep filter .email = "mhinds1"),
    training := (select training::Training filter .name = "Scroll Saw" and exists .rep),
    rep := ((select training::Training filter .name = "Scroll Saw" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # Sanding Machines (Mainspace)
  (insert tools::GroupedTool {
    name := "Sanding Machines",
    location := MS,
    training := (select training::Training filter .name = "Sanding Machines" and exists .rep),
    tools := {
      (insert tools::Tool {
        name := "Wood Sander",
        description := "Used for removing material from timbers and approved plastics down to dimension before fine finishing with sandpaper.",
        responsible_reps := (select users::Rep filter .email = "whpowell1"),
        training := (select training::Training filter .name = "Sanding Machines" and exists .rep),
        rep := ((select training::Training filter .name = "Sanding Machines" and exists .rep).rep),
        location := MS,
        status := (code := tools::Status.NOMINAL, reason := ""),
        is_bookable := false,
        quantity := 1,
        borrowable := false,
        grouped := true,
      }),
      (insert tools::Tool {
        name := "Metal Sander",
        description := "Used for removing material from metal to dimension before fine finishing with sandpaper. Parts can become very hot to the touch so intermittent cooling with water is advised using the provided pot of water.",
        responsible_reps := (select users::Rep filter .email = "whpowell1"),
        training := (select training::Training filter .name = "Sanding Machines" and exists .rep),
        rep := ((select training::Training filter .name = "Sanding Machines" and exists .rep).rep),
        location := MS,
        status := (code := tools::Status.NOMINAL, reason := ""),
        is_bookable := false,
        quantity := 1,
        borrowable := false,
        grouped := true,
      }),
    }
  }),
  # pillar drills (Mainspace)
  (insert tools::GroupedTool {
    name := "Pillar Drill",
    location := MS,
    training := (select training::Training filter .name = "Pillar Drill" and exists .rep),
    tools := {
      (insert tools::Tool {
        name := "Wood Pillar Drill",
        description := "Used for drilling holes in wood and approved plastics.",
        responsible_reps := (select users::Rep filter .email = "callan2"),
        training := (select training::Training filter .name = "Pillar Drill" and exists .rep),
        rep := ((select training::Training filter .name = "Pillar Drill" and exists .rep).rep),
        location := MS,
        status := (code := tools::Status.NOMINAL, reason := ""),
        is_bookable := false,
        quantity := 1,
        borrowable := false,
        grouped := true,
      }),
      (insert tools::Tool {
        name := "Metal Pillar Drill",
        description := "Used for drilling holes in metal.",
        responsible_reps := (select users::Rep filter .email = "callan2"),
        training := (select training::Training filter .name = "Pillar Drill" and exists .rep),
        rep := ((select training::Training filter .name = "Pillar Drill" and exists .rep).rep),
        location := MS,
        status := (code := tools::Status.NOMINAL, reason := ""),
        is_bookable := false,
        quantity := 1,
        borrowable := false,
        grouped := true,
      }),
    }
  }),
  # electronics (Mainspace)
  (insert tools::Tool {
    name := "Electronics",
    description := "Includes soldering irons and other tools for electronic assembly and repair.",
    responsible_reps := (select users::Rep filter .email = "swtsang1"),
    training := (select training::Training filter .name = "Hot Tools" and exists .rep),
    rep := ((select training::Training filter .name = "Hot Tools" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,  # TODO 3?
    borrowable := false
  }),
  # Hot glue gun (Mainspace)
  (insert tools::Tool {
    name := "Hot Glue Gun",
    description := "Used for bonding materials quickly with hot melt adhesive.",
    responsible_reps := (select users::Rep filter .email = "swtsang1"),
    training := (select training::Training filter .name = "Hot Tools" and exists .rep),
    rep := ((select training::Training filter .name = "Hot Tools" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1, # TODO
    borrowable := false
  }),
  # Heat Gun (Mainspace)
  (insert tools::Tool {
    name := "Heat Gun",
    description := "Used for heat shrinking, paint stripping, and other applications requiring directed hot air.",
    responsible_reps := (select users::Rep filter .email = "swtsang1"),
    training := (select training::Training filter .name = "Hot Tools" and exists .rep),
    rep := ((select training::Training filter .name = "Hot Tools" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1, # TODO
    borrowable := false
  }),
  # Line Bender (Mainspace)
  (insert tools::Tool {
    name := "Line Bender",
    description := "Used for bending and shaping acrylic and plastic sheets along straight lines using heat. It can be bent using a jig set to the desired angle.",
    responsible_reps := (select users::Rep filter .email = "swtsang1"),
    training := (select training::Training filter .name = "Hot Tools" and exists .rep),
    rep := ((select training::Training filter .name = "Hot Tools" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # Hot Wire Cutter (Mainspace)
  (insert tools::Tool {
    name := "Hot Wire Cutter",
    description := "A tool that uses a heated wire (around 200°C) to cut through foam, polystyrene with a thin, taut metal wire.

    When the wire moves through the material the heat from the wire vaporises the material just before it touches the wire.",
    responsible_reps := (select users::Rep filter .email = "mhinds1"),
    training := (select training::Training filter .name = "Hot Tools" and exists .rep),
    rep := ((select training::Training filter .name = "Hot Tools" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # CNC Router (Mainspace)
  (insert tools::Tool {
    name := "CNC Router",
    description := "A 3-axis CNC machine (Router 2600 Pro) suitable for a variety of jobs, such as engraving, cutting out moulds, structural parts and more from timbers, foams and plastics.

Typically this involves using Fusion 360 to create toolpaths based on a CAD model which then produces GCode that runs on Denford's software.
    ",
    responsible_reps := (select users::Rep filter .email = "jslater6"),
    training := (select training::Training filter .name = "CNC Router" and exists .rep),
    rep := ((select training::Training filter .name = "CNC Router" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := true,
    max_booking_weekly := <duration>"8h",
    min_booking_time := <duration>"1h",
    quantity := 1,
    borrowable := false
  }),
  # CNC Mill (Mainspace)
  (insert tools::Tool {
    name := "CNC Mill",
    description := "A 3-axis CNC machine (VMC 1300 Pro) has high torque and is suited for machining metal parts.

Typically this involves using Fusion 360 to create toolpaths based on a CAD model which then produces .FNC GCode that runs on Denford's software.",
    responsible_reps := (select users::Rep filter .email = "jslater6"),
    training := (select training::Training filter .name = "CNC Mill" and exists .rep),
    rep := ((select training::Training filter .name = "CNC Mill" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := true,
    max_booking_daily := <duration>"8h",
    min_booking_time := <duration>"1h",
    quantity := 1,
    borrowable := false
  }),
  # 3D Printer (Mainspace)
  (insert tools::Tool {
    name := "3D Printer",
    description := "Prusa Core Ones that can print PLA.",
    responsible_reps := {},
    training := (select training::Training filter .name = "3D Printer" and exists .rep),
    rep := ((select training::Training filter .name = "3D Printer" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),  # don't use these for 3d printers
    is_bookable := false,
    quantity := 4,
    borrowable := false
  }),
  (insert tools::GroupedTool {
    name := "3D Printer",
    location := HS,
    training := (select training::Training filter .name = "3D Printer" and exists .rep),
    tools := {
      (insert tools::Tool {
        name := "3D Printer",
        description := "Prusa Core Ones that can print PLA.",
        responsible_reps := {},
        training := (select training::Training filter .name = "3D Printer" and exists .rep),
        rep := ((select training::Training filter .name = "3D Printer" and exists .rep).rep),
        location := HS,
        status := (code := tools::Status.NOMINAL, reason := ""),  # don't use these for 3d printers
        is_bookable := false,
        quantity := 4,
        grouped := true,
        borrowable := false
      }),
      (insert tools::Tool {
        name := "3D Exotics Printer",
        description := "Prusa i3 MK3S that print PETG and TPU.",
        responsible_reps := {},
        training := (select training::Training filter .name = "3D Printer" and exists .rep),
        rep := ((select training::Training filter .name = "3D Printer" and exists .rep).rep),
        location := HS,
        status := (code := tools::Status.NOMINAL, reason := ""),  # don't use these for 3d printers
        is_bookable := false,
        quantity := 2,
        grouped := true,
        borrowable := false
      }),
    }
  }),
  # Water Jet Cutter (Mainspace)
  (insert tools::Tool {
    name := "Water Jet Cutter",
    description := "A CNC tool used to cut shapes in a variety of materials, ranging from metal sheets to carbon fibre.",
    responsible_reps := (select users::Rep filter .email = "bschumann1"),
    training := (select training::Training filter .name = "Water Jet Cutter" and exists .rep),
    rep := ((select training::Training filter .name = "Water Jet Cutter" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := true,
    max_booking_daily := <duration>"1h30m",
    min_booking_time := <duration>"45m",
    quantity := 1,
    borrowable := false
  }),
  # Powered Hand Tools (Mainspace)
  (insert tools::Tool {
    name := "Powered Hand Tools",
    description := "Assorted powered hand tools including jigsaws, hand drills, handheld pad/belt sanders and rotary tools.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Powered Hand Tools" and exists .rep),
    rep := ((select training::Training filter .name = "Powered Hand Tools" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # Unpowered Hand Tools (Mainspace)
  (insert tools::Tool {
    name := "Unpowered Hand Tools",
    description := "Assorted unpowered hand tools including saws, hammers, screwdrivers, and wrenches.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Unpowered Hand Tools" and exists .rep),
    rep := ((select training::Training filter .name = "Unpowered Hand Tools" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # Laser Cutter (Mainspace)
  (insert tools::GroupedTool {
    name := "Laser Cutter",
    location := MS,
    training := (select training::Training filter .name = "Laser Cutter" and exists .rep),
    tools := {
      (insert tools::Tool {
        name := "ULS Laser Cutter",
        description := "A CNC tool that can cut or engrave thin sheets of timber or plastic. Recommended for bigger jobs",
        responsible_reps := (select users::Rep filter .email in {"dkim41", "whpowell1", "oimkandil1"}),
        training := (select training::Training filter .name = "Laser Cutter" and exists .rep),
        rep := ((select training::Training filter .name = "Laser Cutter" and exists .rep).rep),
        location := MS,
        status := (code := tools::Status.NOMINAL, reason := ""),
        is_bookable := false,
        quantity := 3,
        borrowable := false,
        grouped := true,
      }),
      (insert tools::Tool {
        name := "Laserscript Laser Cutter",
        description := "A CNC tool that can cut or engrave thin sheets of timber or plastic. Recommended for more detailed jobs",
        responsible_reps := (select users::Rep filter .email = "dklos1"),
        training := (select training::Training filter .name = "Laser Cutter" and exists .rep),
        rep := ((select training::Training filter .name = "Laser Cutter" and exists .rep).rep),
        location := MS,
        status := (code := tools::Status.NOMINAL, reason := ""),
        is_bookable := false,
        quantity := 1,
        borrowable := false,
        grouped := true,
      }),
    },
  }),
  # Vacuum Former (Mainspace)
  (insert tools::Tool {
    name := "Vacuum Former",
    description := "A tool used to shape plastic sheets into specific forms using heat and suction around a mold.",
    responsible_reps := (select users::Rep filter .email = "swtsang1"),
    training := (select training::Training filter .name = "Vacuum Former" and exists .rep),
    rep := ((select training::Training filter .name = "Vacuum Former" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # Sewing Machine (Mainspace)
  (insert tools::Tool {
    name := "Sewing Machine",
    description := "A tool for stitching fabric and other materials together.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Sewing Machine" and exists .rep),
    rep := ((select training::Training filter .name = "Sewing Machine" and exists .rep).rep),
    location := MS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,  # TODO
    borrowable := false
  }),
  # Embroidery Machine (Heartspace)
  (insert tools::Tool {
    name := "Embroidery Machine",
    description := "A CNC tool for creating patterns and designs on fabric using thread.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Embroidery Machine" and exists .rep),
    rep := ((select training::Training filter .name = "Embroidery Machine" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # Overlocker (Heartspace)
  (insert tools::Tool {
    name := "Overlocker",
    description := "A sewing machine that sews over the edge of one or two pieces of cloth for edging, hemming, or seaming.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Overlocker" and exists .rep),
    rep := ((select training::Training filter .name = "Overlocker" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # Vinyl Cutter (Heartspace)
  (insert tools::Tool {
    name := "Vinyl Cutter",
    description := "A CNC tool used to cut vinyl and other thin materials into shapes and designs.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Vinyl Cutter" and exists .rep),
    rep := ((select training::Training filter .name = "Vinyl Cutter" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # Sublimation Printer & T-Shirt Press (Heartspace)
  (insert tools::Tool {
    name := "Sublimation Printer & T-Shirt Press",
    description := "A printer that uses sublimation ink to transfer designs onto fabrics and other materials, paired with a heat press for application.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Sublimation Printer & T-Shirt Press" and exists .rep),
    rep := ((select training::Training filter .name = "Sublimation Printer & T-Shirt Press" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # SLA Printer (Heartspace)
  (insert tools::GroupedTool {
    name := "SLA Printer",
    location := HS,
    training := (select training::Training filter .name = "SLA Printer" and exists .rep),
    tools := {
      (insert tools::Tool {
        name := "Anycubic SLA Printer",
        description := "A stereolithography 3D printer that uses UV light to cure resin layer by layer for high-detail prints.",
        responsible_reps := {},
        training := (select training::Training filter .name = "SLA Printer" and exists .rep),
        rep := ((select training::Training filter .name = "SLA Printer" and exists .rep).rep),
        location := HS,
        status := (code := tools::Status.NOMINAL, reason := ""),
        is_bookable := true,
        min_booking_time := <duration>"4h",
        bookable_hours := {
          <cal::local_time>"12:00:00",
          <cal::local_time>"16:00:00",
        },
        quantity := 1,
        borrowable := false,
        grouped := true,
      }),
      (insert tools::Tool {
        name := "Formlabs SLA Printer",
        description := "A professional-grade stereolithography 3D printer that uses UV light to cure resin for high-quality prints.",
        responsible_reps := {},
        training := (select training::Training filter .name = "SLA Printer" and exists .rep),
        rep := ((select training::Training filter .name = "SLA Printer" and exists .rep).rep),
        location := HS,
        status := (code := tools::Status.NOMINAL, reason := ""),
        is_bookable := true,
        min_booking_time := <duration>"4h",
        bookable_hours := {
          <cal::local_time>"12:00:00",
          <cal::local_time>"16:00:00",
        },
        quantity := 1,
        borrowable := false,
        grouped := true,
      }),
    }
  }),
  # Sewing Machine (Heartspace)
  (insert tools::Tool {
    name := "Sewing Machine",
    description := "A tool for stitching fabric and other materials together.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Sewing Machine" and exists .rep),
    rep := ((select training::Training filter .name = "Sewing Machine" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,  # TODO
    borrowable := false
  }),
  # Mug Press (Heartspace)
  (insert tools::Tool {
    name := "Mug Press",
    description := "A tool for transferring designs onto mugs using Infusible Ink materials. Features automated temperature and pressure settings.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Mug Press" and exists .rep),
    rep := ((select training::Training filter .name = "Mug Press" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # Hat Press (Heartspace)
  (insert tools::Tool {
    name := "Hat Press",
    description := "A tool for transferring designs onto hats. Works with the Cricut Heat app for precise temperature and timing control.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Hat Press" and exists .rep),
    rep := ((select training::Training filter .name = "Hat Press" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # Cricut Cutting Machine (Heartspace)
  (insert tools::Tool {
    name := "Cricut Cutting Machine",
    description := "A versatile cutting machine for crafts that can cut paper, vinyl, fabric, and other materials with precision.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Cricut Cutting Machine" and exists .rep),
    rep := ((select training::Training filter .name = "Cricut Cutting Machine" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),
  # Badge Maker
  (insert tools::Tool {
    name := "Badge Maker",
    description := "A tool for making personalised high quality badges at three different sizes 25mm, 38mm and 45mm.",
    responsible_reps := {},
    training := (select training::Training filter .name = "Heartspace Induction" and exists .rep),
    rep := ((select training::Training filter .name = "Heartspace Induction" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),

  # 3D Scanning (Heartspace)
  (insert tools::Tool {
    name := "3D Scanning",
    description := "A tool for capturing a digital model of an object.",
    responsible_reps := {},
    training := (select training::Training filter .name = "3D Scanning" and exists .rep),
    rep := ((select training::Training filter .name = "3D Scanning" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),

  # Mini Iron (Heartspace)
  (insert tools::Tool {
    name := "Mini Iron",
    description := "A tool to create or get rid of folds in material, or attach iron-on patches",
    responsible_reps := {},
    training := (select training::Training filter .name = "Heartspace Induction" and exists .rep),
    rep := ((select training::Training filter .name = "Heartspace Induction" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),

  # Sewing Tools (Heartspace)
  (insert tools::Tool {
    name := "Sewing Tools",
    description := "Tools to support your textile projects",
    responsible_reps := {},
    training := (select training::Training filter .name = "Heartspace Induction" and exists .rep),
    rep := ((select training::Training filter .name = "Heartspace Induction" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  }),

  # Leather Working Tools (Heartspace)
  (insert tools::Tool {
    name := "Leather Working Tools",
    description := "Tools to create your own leather creations such as belts, casings or jewellery",
    responsible_reps := {},
    training := (select training::Training filter .name = "Heartspace Induction" and exists .rep),
    rep := ((select training::Training filter .name = "Heartspace Induction" and exists .rep).rep),
    location := HS,
    status := (code := tools::Status.NOMINAL, reason := ""),
    is_bookable := false,
    quantity := 1,
    borrowable := false
  })
};