## Rules

Routes should use common verbage

get
create
remove (delete is a keyword in js)
add - appending a new entry/link

File paths should directly match those of the route. If you wish to not include a folder/file in the file path you can use `.$param_name`.

e.g. `users/$id/training/in-person.$location` -> `/api/users/{id}/training/in-person/{location}`


TODO middleware that autodocs the body?