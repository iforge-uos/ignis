select notification::AuthoredNotification {
    *,
    author: {
        id,
        pronouns,
        email,
        display_name,
        username,
        ucard_number,
        profile_picture,
        created_at,
        roles: {
            id,
            name,
        },
    },
    targets: {
        id,
        [is users::User].display_name,
        [is team::Team | event::Event | notification::MailingList].name,
        __typename := .__type__.name,
    }
}