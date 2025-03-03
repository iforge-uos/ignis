module sign_in {
    type SignIn extending default::Timed {
        required user: users::User;
        required location: Location;
        required tools: array<str>;
        required reason: Reason;
        required signed_out := (
            select exists .ends_at
        );

        constraint exclusive on (.user) except (.signed_out);


    }

    # N.B. make sure to update in forge/lib/constants
    scalar type LocationName extending enum<
        MAINSPACE,
        HEARTSPACE,
    >;

    scalar type LocationStatus extending enum<
        OPEN,
        SOON,
        CLOSED,
    >;

    type Location extending default::Auditable {
        required name: LocationName {
            constraint exclusive;
        }
        multi opening_days: int16 {
            annotation description := "1-7, the days of the week we are currently open, Monday (1) to Sunday (7)"
        };
        required opening_time: cal::local_time;
        required closing_time: cal::local_time;
        required in_of_hours_rep_multiplier: int16;
        required out_of_hours_rep_multiplier: int16;
        required max_users: int16;
        # required short_term_closures: tuple<starts_at: datetime, ends_at: datetime>;

        multi sign_ins := (
            select .<location[is SignIn] filter not .signed_out
        );
        multi queued := .<location[is QueuePlace];

        required out_of_hours := (
            with current_time := (
                select cal::to_local_time(datetime_of_statement(), "Europe/London")
            ),
            select (
                not (
                    .opening_time <= current_time and current_time <= .closing_time
                    and <int16>datetime_get(datetime_of_statement(), "isodow") in .opening_days
                )
            )
        );
        required status := (
            with current_time := (
                select cal::to_local_time(datetime_of_statement(), "Europe/London")
            ),
            select (
                LocationStatus.OPEN if count(.on_shift_reps) > 0 else
                LocationStatus.SOON if (
                    (
                        .opening_time - <cal::relative_duration>"30m" <= current_time
                        and current_time <= .closing_time - <cal::relative_duration>"30m"
                    )
                    and datetime_get(datetime_of_statement(), "isodow") in .opening_days
                )
                else LocationStatus.CLOSED
            )
        );

        multi on_shift_reps := (
            with rep_sign_ins := (
                select .sign_ins filter .user is users::Rep and .reason.name = "Rep On Shift"
            ),
            select rep_sign_ins.user[is users::Rep]
        );
        multi off_shift_reps := (
            with rep_sign_ins := (
                select .sign_ins filter .user is users::Rep and .reason.name = "Rep Off Shift"
            ),
            select rep_sign_ins.user[is users::Rep]
        );
        multi supervising_reps := (  # reps are always meant to be supervising cause everyone is responsible for H+S but can't think of a better name
            select (.on_shift_reps union .off_shift_reps) if .out_of_hours else .on_shift_reps
        );
        multi supervisable_training := (
            select distinct .supervising_reps.supervisable_training
            # silly cast incoming (sign_in::LocationName <: training::LocationName but gel doesn't recognise this)
            filter <training::LocationName>(<str>__source__.name) in .locations
        );

        required max_count := (
            select min(
                {
                    (select .out_of_hours_rep_multiplier if .out_of_hours else .in_of_hours_rep_multiplier) * count(.supervising_reps),
                    .max_users,
                }
            )
        );

        required can_sign_in := (
            # the hard cap assuming you're signing in as a user, on shift reps skip this check
            select count(.sign_ins) < .max_count
        );

        required queue_enabled: bool {
            default := true;
            annotation description := "Manually disable the queue.";
        };
        required queue_in_use := (
            select (
                assert(.queue_enabled, message := "Queue has been manually disabled")
                and exists .queued
                or not .can_sign_in
            )
        );
        multi queued_users_that_can_sign_in := (
            select (
                select .queued filter .ends_at >= datetime_of_statement()
            ).user
        );


    }

    type UserRegistration extending default::CreatedAt {
        required location: Location;
        required user: users::User {
            constraint exclusive;
        }


    }

    type QueuePlace extending default::CreatedAt {  # TODO consider storing these permanently
        required user: users::User {
            constraint exclusive;
        }
        required location: Location;
        notified_at: datetime {
            annotation description := "The time the user was emailed that they have a slot."
        }
        ends_at := .notified_at + <cal::relative_duration>"20m";

        trigger prohibit_queue after insert for each do (
            select assert(__new__.location.queue_in_use, message := "Queue has been manually disabled")
        );


    }

    scalar type ReasonCategory extending enum<
        UNIVERSITY_MODULE,
        CO_CURRICULAR_GROUP,
        PERSONAL_PROJECT,
        SOCIETY,
        REP_SIGN_IN,
        EVENT,
    >;

    type Reason extending default::CreatedAt {
        required name: str {
            constraint exclusive;
        }
        required category: ReasonCategory;
        agreement: Agreement;
        index on ((.name));


    }

    type Agreement extending default::Auditable {
        required name: str;
        multi reasons := .<agreement[is Reason];
        required content: str {
            annotation description := "The content of the markdown file that are served to the user."
        }
        # implementation detail caused by not being able to index on contents over some large number of characters
        required _content_hash: bytes {
            default := ext::pgcrypto::digest(.content, 'sha256');
            rewrite update using (
                ext::pgcrypto::digest(.content, 'sha256')
            )
        }
        required version: int16 {
            default := 1;
            rewrite update using (
                # updating the name shouldn't trigger everyone to re-sign
                .version + 1 if __subject__.content != __old__.content else .version
                # TODO make this make a request to the server to send out a notification to make everyone re-sign
                # using ext::net or the events system
            )
        }

        constraint exclusive on ((.version, ._content_hash));

    }
}
