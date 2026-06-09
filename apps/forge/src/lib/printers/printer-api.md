# Api calls for print queue
- Can't add new printer, as apikeys needed through .env and 1password
- all path roots are /api/print/
- if no response, assume a standard success/failure response
- Where paramter for printer is passes, it is the printer name

## Disconnect printer
```
method: DELETE
path: printer/{id}
parameters: printer
auth: 3dp
```

## Connect Printer
- Uses connect printer in /src/printing.ts
```
method: POST
path: printer/{id}
parameters: printer
auth: 3dp
```

## Reconnect printer
disconnect and reconnect
```
method: PATCH
path: printer/{id}
parameters: printer
auth: 3dp
```

## Upload to queue
```
method: POST
path: queue
body: printjob (see printing.gel schema), gcode/stl, timelapse?, queue
auth: 3dp (subject to change)
```

## Get queue for printer
```
method: GET
path: queue?printer=[id]
parameters: printer
auth: 3dp (to keep jobs private)
repsonse: array of printjobs (see printing.gel schema)
```

## Get queue by type
```
method: GET
path: queue?material=[material]
parameters: queue type
auth: 3dp
repsonse: array of printjobs (see printing.gel schema)
```

## Get queue under review
```
method: GET
path: queue?review=true
auth: 3dp
response: array of printjobs
```

## Get queued by user
```
method: GET
path: queue?user=[id]
parameters: user_id
auth: 3dp or user (only for their own queue)
response: array of printjobs
```

## Download gcode/stl
```
method: GET
path: queue/{id}/stl or gcode
Parameters: printjob, stl or gcode
auth: 3dp
response: gcode/stl file
```

## Edit printjob status
```
method: PATCH
method: queue/{id}/status
parameters: printjob
auth: 3dp
body: new status (rejected, accepeted, under review)
```

## Edit prinjob
```
method: PATCH
path: queue/{id}
parameters: printjob
auth: 3dp
body: filament, priority, timelapse
```

## Select file to print 
```
method: POST
path: queue/{id}/send?printer=[id]
auth: 3dp-admin (so only people onsite can send)
parameters: printer, printjob
```

## Pause print
```
method: PATCH
path: printer/{id}/pause
auth: 3dp
parameters: printer
```

## Resume print
```
method: PATCH
path: printer/{id}/resume
auth: 3dp
parameters: printer
```

## Cancel print
```
method: PATCH
path: printer/{id}/cancel
auth: 3dp
parameters: printer
```

## Finish print
```
method: DELETE
path: printer/{id}/finish
parameters: printer
auth: 3dp
body: requeue? success, message?
```

## List Printers
```
method: GET
path: printer
auth: 3dp
response: returns printers from forge/src/printing.ts
```

## Edit printer filament slot
- only for single filament printer
```
method: PATCH
path: printer/{id}/filament?upload=true
parameters: printer
auth: 3dp
body: filament slot (slot_id, material, colour, max/min temp, bed temp)
```

## Sync filament slots on multi printers
```
method: PATCH
path: printer/{id}/filament?upload=false
auth: 3dp
parameters: printer
```

## Check printer connection status
```
method: GET
path: printer/{id}/status/connection
parameters: printer
auth: 3dp
response: boolean
```

## Disable printer
```
method: DELETE
path: printer/{id}/enabled
parameters: printer_id
auth: 3dp
body: reason (enum/note), end_time
```

## Enable Printer
- Can stop a scheduled early
```
method: POST
path: printer/{id}/enabled
parameters: printerid
auth: 3dp
```

## Schedule down time
```
method: POST
path: printer/downtime/{id}
parameters: printer
auth: 3dp
body: date/time, length of time or finish time, reason 
```

## List Downtimes
```
method: GET
path: printer/downtime
auth: 3dp
response: array of downtimes (downtime id, printer, date/time, length of time)
```

## Remove downtime
```
method: DELETE
path: printer/downtime/{id}
auth: 3dp
parameters: downtime_id
```

## Get downtime history
- all, including future
```
method: GET
path: printer/downtime/{id}
parameters: printer
auth: 3dp
respons: array of downtimes
```

## Get printer history
```
method: GET
path: history/{id}
parameters: printer
auth: 3dp
response: list of printjobs and results
```

## Get history stats
```
method: GET
path: history
body: start time, end time
auth: 3dp
response: json of stats for printers like success rate, overall and per printer, number of prints etc
```

## Get user print history
```
method: GET
path: history/users
auth: 3dp or user for themselves
response: prints
```

## Get rep printer status (competition)
```
method: GET
path: history/reps
auth: rep
response: array of objects whioch include rep, position, failed/success, number etc
```

## Get printer config (exludes apikeys, password etc)
```
method: GET
path: printer/{id}/status/config
parameters: printer
auth: 3dp
response: printer config
```

## Get printer status
```
method: GET
path: printer/{id}/status
paremeters: printer/s
auth: 3dp
response: printer status/array (if disables, return disabled and when till)
```

<br><br><br>

**TBC**
## Subscribe to printer status
*Should this be done on the frontend or backend, i.e. subscribe then recieve packets from server, or request packates every interval using the 'get print status' call*

## Unsubscribe to printer status

## Get print history timelapse
- Needs implementing into drivers first



