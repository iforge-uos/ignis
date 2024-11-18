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

    # scalar type LocationStatus extending enum<
    #     OPEN,
    #     SOON,
    #     CLOSED,
    # >;

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
            select SignIn
            filter not .signed_out and .location = __source__
        );
        multi queued := (
            select QueuePlace
            filter .location = __source__
        );

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
                select cal::to_local_time(datetime_of_statement(), 'Europe/London')
            ),
            select (
                "open" if count(.on_shift_reps) > 0 else
                "soon" if (
                    (
                        .opening_time - <cal::relative_duration>"30m" <= current_time
                        and current_time <= .closing_time - <cal::relative_duration>"30m"
                    )
                    and datetime_get(datetime_of_statement(), "isodow") in .opening_days
                )
                else "closed"
            )
        );

        multi on_shift_reps := (
            with rep_sign_ins := (
                select .sign_ins filter .user is users::Rep and .reason.name = "Rep On Shift"
            ),
            select rep_sign_ins.user
        );
        multi off_shift_reps := (
            with rep_sign_ins := (
                select .sign_ins filter .user is users::Rep and .reason.name = "Rep Off Shift"
            ),
            select rep_sign_ins.user
        );
        multi supervising_reps := (  # reps are always meant to be supervising cause everyone is responsible for H+S but can't think of a better name
            select (.on_shift_reps union .off_shift_reps) if .out_of_hours else .on_shift_reps
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
            select (
                # the hard cap assuming you're signing in as a user, on shift reps skip this check
                count(.sign_ins) < .max_count
                and (.max_count + count(.supervising_reps) - count(.sign_ins)) >= 0
            )
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
        )
    }

    type UserRegistration extending default::CreatedAt {
        required location: Location;
        required user: users::User;
    }

    type QueuePlace extending default::CreatedAt {  # TODO consider storing these permenantly
        required user: users::User {
            constraint exclusive;
        }
        required location: Location;
        notified_at: datetime {
            annotation description := "The time the user was emailed that they have a slot."
        }
        ends_at := .notified_at + <cal::relative_duration>"15m";
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

    type Agreement extending default::CreatedAt {
        required name: str;
        multi reasons := (
            select Reason filter .agreement = __source__
        );
        required content: str {
            annotation description := "The content of the markdown file that are served to the user."
            # annotation description := "The bytes of the PDF file that are served to the UI."
        }
        required content_hash: str {
            annotation description := "The hash of the content of the markdown file."
        }
        required version: int16 {
            default := 1;
        }

        constraint exclusive on ((.version, .content_hash));
    }
}
