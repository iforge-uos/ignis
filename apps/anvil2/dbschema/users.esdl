module users {
    type User extending default::Auditable {
        required ucard_number: int32 {
            constraint exclusive;
        };
        required username: str {
            annotation description := "The user's university login.";
            constraint exclusive;
        };
        required email: str {
            rewrite insert, update using (str_lower(.email));
            constraint regexp(r'[\w\-\.]+');  # we don't store the domain because it should always be sheffield.ac.uk
            constraint exclusive;
        }
        required organisational_unit: str {
            annotation description := "The user's school/faculty e.g. Music or IPE";
        };

        required first_name: str;
        last_name: str;  # not everyone has a last name
        required display_name: str {
            default := str_trim(.first_name ++ " " ++ .last_name) IF .last_name ?!= "" ELSE .first_name;
        };
        pronouns: str;
        profile_picture: str {
            annotation description := "The user's profile picture from their google account";
        }

        multi agreements_signed: sign_in::Agreement {
            created_at: datetime {
                readonly := true;
                default := datetime_of_statement();
            }
        }
        multi training: training::Training {
            created_at: datetime {
                readonly := true;
                default := datetime_of_statement();
            }
            in_person_created_at: datetime;
            in_person_signed_off_by: uuid;  # a rep ID, hopefully can be migrated to the actual object when the requirement for these to be scalars is lifted.
            infraction: uuid;  # same as above
        }

        required identity: ext::auth::Identity;
        multi roles: Role;

        multi infractions: Infraction;

        multi mailing_list_subscriptions: notification::MailingList;
        multi notifications: notification::Notification {
            acknowledged: datetime {
                annotation description := "Time the user has dismissed / marked as read / interacted with it (will be true if noti type is email & is delivered) otherwise empty";
            }
        };

        multi referrals: User {
            created_at: datetime {
                readonly := true;
                default := datetime_of_statement();
                # rewrite insert using (datetime_of_statement())  // might be possible see EdgeDB/edgedb#6467
            };
        }

        access policy rep_or_higher
            allow all
            using (exists ({"Rep", "Desk", "Admin"} intersect global default::user.roles.name)) {
                errmessage := "Only reps can see everyone's profile"
            };
        access policy view_self
            allow all
            using (global default::user ?= __subject__) {
                errmessage := 'Can only view your own profile'
            };
    }

    scalar type RepStatus extending enum<
        ACTIVE,
        BREAK,
        ALUMNI,
        FUTURE,
        REMOVED,
    >;

    type Rep extending User {
        required multi teams: team::Team {
            extending default::timed;
        }
        required status: RepStatus {
            default := RepStatus.ACTIVE;
        }
        multi supervisable_training := (
            with current_training := .training,  # need to store this in a local var cause otherwise it doesn't work
            select .training
            filter (
                exists .rep and  # it's user training
                .rep in current_training and  # they have the rep training in their own training
                (not .in_person or exists @in_person_created_at)  # must also have the in person training
            )
        );
    }

    type Role {
        required name: str {
            constraint exclusive;
        };
    }

    # N.B. make sure to update in forge/lib/constants
    scalar type InfractionType extending enum<
        WARNING,
        TEMP_BAN,
        PERM_BAN,
        RESTRICTION,
        TRAINING_ISSUE,
    >;

    type Infraction extending default::CreatedAt {
        required user: User;
        required type: InfractionType;
        required reason: str;
        required resolved: bool {
            annotation description := "Whether the infraction has been resolved or is still active";
            default := false;
        };
        ends_at := .created_at + .duration;
        duration: duration;

        access policy desk_or_higher
            allow all
            using (exists ({"Desk", "Admin"} intersect global default::user.roles.name)) {
                errmessage := "Only the desk account or admins can update infractions"
            };

        trigger log_insert after insert for each do (
            net::http::schedule_request(
                (select global default::INFRACTIONS_WEBHOOK_URL),
                method := net::http::Method.POST,
                headers := [('Content-Type', 'application/json')],
                body := <bytes>$${
                    "embeds": [{
                        "title": "User Infraction Added to \(__new__.user.name)",
                        "description": "Type: \(__new__.type)\nReason: \(__new__.reason)\nResolved: \(__new__.resolved)\n\n\(
                            "Ends <t:" ++ datetime_get(__new__.ends_at, "epochseconds") ++ ">"
                            if exists __new__.duration
                            else ""
                        )",
                        "color": 10953233,
                        "url": "https://iforge.sheffield.ac.uk/users/\(__new__.user.id)",
                        "thumbnail": {
                            "url": "\(__new__.user.profile_picture)"
                        }
                    }]}$$,
            )
        );
        trigger log_update after update for each do (
            net::http::schedule_request(
                (select global default::INFRACTIONS_WEBHOOK_URL),
                method := net::http::Method.POST,
                headers := [('Content-Type', 'application/json')],
                body := <bytes>$${
                    "embeds": [{
                        "title": "User Infraction Updated for \(__new__.user.name)",
                        "description": "Type: \(__new__.type)\nReason: \(__new__.reason)\nResolved: \(__new__.resolved)\n\n\(
                            "Ends <t:" ++ datetime_get(__new__.ends_at, "epochseconds") ++ ">"
                            if exists __new__.duration
                            else ""
                        )",
                        "color": 10953233,
                        "url": "https://iforge.sheffield.ac.uk/users/\(__new__.user.id)",
                        "thumbnail": {
                            "url": "\(__new__.user.profile_picture)"
                        }
                    }]}$$,
            )
        );
      }

    type SettingTemplate {
        required key: str {
            constraint exclusive;
        }
        required default_value: str;

        index on (.key);
    }

    type UserSettingValue {
        annotation description := "A user's specific preference. Should only be inserted if not same as default";
        required value: str;
        required user: User;
        required template: SettingTemplate;

        index on ((.user, .template));
    }

    scalar type Platform extending enum<
        DISCORD,
        GITHUB,
    >;

    type Integration extending default::Auditable {
        required user: User;
        required platform: Platform;
        required external_id: str;
        required external_email: str;

        index on ((.platform, .user));
        index on ((.platform, .external_id));
        constraint exclusive on ((.platform, .user));
        constraint exclusive on ((.platform, .external_id));
    }
}