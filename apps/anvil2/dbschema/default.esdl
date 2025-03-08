using future simple_scoping;

using extension pg_trgm;
using extension auth;
using extension pgcrypto;

module default {
    global user := assert_single((
        select users::User
        filter .identity = global ext::auth::ClientTokenIdentity
    ));
    global INFRACTIONS_WEBHOOK_URL: str;

    abstract type CreatedAt {
        required created_at: datetime {
            readonly := true;
            default := datetime_of_statement();
        }
    }

    abstract type Auditable extending CreatedAt {
        required updated_at: datetime {
            default := datetime_of_statement();
            rewrite update using (datetime_of_statement())
        };
    }

    abstract type Timed extending CreatedAt {
        ends_at: datetime;
        required duration := assert_exists(.ends_at - .created_at if exists .ends_at else datetime_of_transaction() - .created_at);
    }

    abstract link timed {
        created_at: datetime {
            readonly := true;
            default := datetime_of_statement();
        }
        ends_at: datetime;
        # duration := .ends_at - .created_at if exists .ends_at else datetime_of_transaction() - .created_at;
    }
}