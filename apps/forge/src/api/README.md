# Anvil


## Rules

Routes should use common verbiage

get (GET)
create (POST)
remove (delete is a keyword in js) (DELETE)
add - appending a new entry/link (PATCH)
replace - I don't think anything will require this (PUT)

File paths should directly match those of the route. If you wish to not include a folder/file in the file path you can use `.$param_name`.

e.g. `users/$id/training/in-person.$location` -> `/api/users/{id}/training/in-person/{location}`

If a path shouldn't show up as a route, prefix the name with an underscore.

idRoutes

TODO update sign in sonners to use abort controllers

TODO make TeamName work?

TODO migrate and double check sentry again https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/#step-3-verify

SEntry dev toolbar
Move to start completely cause lol
think about the rentracnce of the sign in system steps

TODO migrate to webp + https://github.com/drwpow/vite-plugin-lqip + https://github.com/JonasKruckenberg/imagetools/tree/main/packages/vite
