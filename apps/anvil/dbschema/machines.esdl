module machines {
    scalar type Status extending enum<
        NOMINAL,
        IN_USE,
        OUT_OF_ORDER,
    >;

    type Machine {
        required name: str;
        required photo: str {
            annotation description := "A photo on mine of the machine mainly for maintence purposes so we know which is which"
        };
        # required responsible_rep: Rep;  # could potentially use new notifications?

        required multi training: training::Training;
        required location: sign_in::SignInLocation;
        required status: Status;

        required is_bookable: bool;
        multi booking_times: Booking;
        max_booking_daily: cal::relative_duration;
        max_booking_weekly: cal::relative_duration;
        min_booking_time: cal::relative_duration;  # default is 1h for bookable machines

        trigger checks after update for each do (
            with booking := (
                select __new__.booking_times except __old__.booking_times  # get the newly inserted booking
            ),
            week_duration := (
                select sum(
                    (
                        select Booking filter (
                            .user = booking.user
                            and .created_at < datetime_of_statement() - <cal::relative_duration>"7d"
                        )
                    ).duration,
                    booking.duration,
                )
            ),
            day_duration := (
                select sum(
                    (
                        select Booking filter (
                            .user = booking.user
                            and .created_at < datetime_of_statement() - <cal::relative_duration>"1d"
                        )
                    ).duration,
                    booking.duration
                )
            ),
            select (
                exists booking  # don't do anything if booking wasn't updated
                and assert(__source__.is_bookable or __source__.status != Status.OUT_OF_ORDER, message := "This machine is not bookable")
                and assert(booking.duration >= __source__.min_booking_time)
                and assert()  # TODO check for overlaps
                and assert(
                    week_duration > __source__.max_booking_weekly,
                    message := (
                        "You can't book this machine for this long as you'll exceed your maximium time for this week by "
                        ++ to_str(duration_get(__source__.max_booking_weekly - week_duration, "totalseconds") / 60)
                        ++ " minutes"
                    ),
                )
                and assert(
                    day_duration > __source__.max_booking_daily,
                    message := (
                        "You can't book this machine for this long as you'll exceed your maximium time for today by "
                        ++ to_str(duration_get(__source__.max_booking_daily - day_duration, "totalseconds") / 60)
                        ++ " minutes"
                    ),
                )
            )
        )
    }

    type Booking extending default::Auditable {
        required user := (
            select assert_exists(users::User filter __source__.id in .bookings.id)
        );
        required starts_at: datetime;
        required ends_at: datetime;
        cancelled: bool {
            annotation description := "Tribool, empty for honoured (signed in and selected as reason), true if
                                      cancelled through Google (if this is possible) or UI, false if not honoured"  # TODO look into requesting read+write calendar perms?
        }
        required duration := .ends_at - .starts_at;
    }
}