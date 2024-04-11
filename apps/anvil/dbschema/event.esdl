module event {
    scalar type EventType extending enum<
        WORKSHOP,
        LECTURE,
        MEETUP,
        HACKATHON,
        EXHIBITION,
        WEBINAR,
    >;

    type Event extending default::CreatedAt {
        required title: str;
        description: str;
        required type: EventType;
        required starts_at: datetime;
        ends_at: datetime;
        required organiser: users::User;
        required multi attendees: users::User {
            registered_at: datetime {
                readonly := true;
                default := datetime_of_statement();
                # rewrite insert using (datetime_of_statement())
            };
        }
    }
}
