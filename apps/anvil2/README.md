## Rules

Routes should use common verbiage

get
create
remove (delete is a keyword in js)
add - appending a new entry/link

File paths should directly match those of the route. If you wish to not include a folder/file in the file path you can use `.$param_name`.

e.g. `users/$id/training/in-person.$location` -> `/api/users/{id}/training/in-person/{location}`

If a path shouldn't show up as a route, prefix the name with an underscore.

TODO middleware that autologs the body?

TODO update sign in sonners to use abort controllers

TODO migrate to add OpenAPILink

TODO tanstack start and make TeamName work?