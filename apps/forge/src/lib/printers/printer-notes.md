# Printer libary overview:
- types.ts contains a base driver/types which specific drivers implement
- This ensures all drivers share the same base set of functions
- manager.ts then encapsulates those drivers allowing all the printers to be managed through 1 class without exposing too much making using it more managable
- **Timelapse hasn't fully been setup yet, bool setup, but in prusa it doesn't do anything and but bambu it does, but not retrieved yet.**
- *Recommend not printing timelapse till implemented*

## types.ts
- Contains enums for colours and materials based of the printing.gel in ignis/packages/db
- Also includes PrinterDriver interface, as well as interfaces for printer status, print jobs, filament slots etc

## prusa-driver.ts
- Prusa uses an inbuilt webapp (prusa link), whose openapi.yaml can be found [here](https://github.com/prusa3d/Prusa-Link-Web/blob/master/spec/openapi.yaml)
- The current setup uses set api keys. however, this may of changed to digest auth (passwords and username etc), so testing needs to be done.
- **Setup for printers with only 1 filament slot**

## bambu-driver.ts
- Bambu is mopre closed off and uses a MQTT and FTP based messaging system, found [here](https://github.com/Doridian/OpenBambuAPI/blob/main/mqtt.md)
- Bambu hides their API/MQTT and SDK behind a request form. However the above link is for a community based access, so may be incorrect or subject to change.
- More info on the SDK can be found [here](https://wiki.bambulab.com/en/software/third-party-integration)
- Also you can daisy chain up AMS systems to get 16 different spools, it is currently setup so only have eeither an external spool, like the Bambu A1 or the inbuilt AMS like the H2D.
- To change the above, somethings need changing with the trays, ams ids and filament slots.

## manager.ts
- Manager to add and use printer instances
- AddPrinter -> Call functions -> Remove printer
- All functions are the same for the basic PrinterDriver class except connect/disconnect which have been replaces as above.
- To call a function you need the name of the printer as defined by the config when connecting
- e.g. getStatus('tolstoy');
- As printer configs are stored on the db, a function can be run to read all the printer configs from the db and add them to a new instance on startup.