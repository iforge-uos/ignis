# Api calls for print queue
- Can't add new printer, as apikeys needed through .env and 1password

## Disconnect printer
```
method: DELETE
parameters: printer
```

## Connect Printer
```
method: POST
parameters: printer
```

## Reconnect printer
```
method: PUT
parameters: printer
```

## Upload to queue
```
method: POST
body: printjob (see printing.gel schema), gcode/stl, timelapse?
```

## Get queue for printer
```
method: GET
parameters: printer
repsonse: array of printjobs (see printing.gel schema)
```

## Get queue by type
```
method: GET
parameters: queue type
repsonse: array of printjobs (see printing.gel schema)
```

## Get queue under review
```
method: GET
response: array of printjobs
```

## Download gcode/stl
```
method: GET
Parameters: printjob, stl or gcode
response: gcode/stl file
```

## Edit printjob status
```
method: PUT
parameters: printjob
body: new status (rejected, accepeted, under review)
```

## Edit prinjob
```
method: PUT
parameters: printjob
body: filament, priority, timelapse
```

## Select file to print 
```
method: POST
parameters: printer, printjob
```

## Pause print
```
method: PUT
parameters: printer
```

## Resume print
```
method: PUT
parameters: printer
```

## Cancel print
```
method: DELETE
parameters: printer
```

## Finish print
```
method: DELETE
parameters: printer,
body: requeue? success, message?
```

## List Printers
```
method: GET
response: printers (id, name, manafacture, model)
```

## Edit printer filament slot
```
method: PUT
parameters: printer
body: filament slot (slot_id, material, colour, max/min temp, bed temp)
```

## Check printer connection status
```
method: GET
parameters: printer
response: boolean
```

## Disable printer
```
method: DELETE
parameters: printer_id
body: reason (enum/note), end_time
```

## Enable Printer
- Can stop a scheduled early
```
method: POST
parameters: printerid
```

## Schedule down time
```
method: POST
parameters: printer
body: date/time, length of time or finish time, reason 
```

## List Downtimes
```
method: GET
response: array of downtimes (downtime id, printer, date/time, length of time)
```

## Remove downtime
```
method: DELETE
parameters: downtime_id
```

## Get downtime history
```
method: GET
parameters: printer
respons: array of downtimes
```

## Get print history
```
method: GET
parameters: printer
response: list of printjobs and results
```

## Get printer config (exludes apikeys, password etc)
```
method: GET
parameters: printer
response: printer config
```

## Get printer status
```
method: GET
paremeters: printer/s
response: printer status/array (if disables, return disabled and when till)
```

## Get SOPs
```
method: GET
repose: array of SOP info
```

## Download SOPs
```
method: GET
reponse: SOP download
```

## Upload/Remove SOP
```
method: POST/DELETE
body: SOP (and file if uploading)
```

<br><br><br>

**TBC**
## Subscribe to printer status
*Should this be done on the frontend or backend, i.e. subscribe then recieve packets from server, or request packates every interval using the 'get print status' call*

## Unsubscribe to printer status

## Get print history timelapse
- Needs implementing into drivers first



