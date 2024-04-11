module sign_in {
    type List {
        required location: SignInLocation {
            constraint exclusive;
            readonly := true;
        }
        multi sign_ins := (
            select SignIn
            filter not .signed_out and .location = __source__.location
        );
        multi queued := (
            select QueuePlace
            filter .location = __source__.location
        );

        index on (.location);
    }

    type SignIn extending default::Timed {
        required user: users::User;
        required location: SignInLocation;
        required tools: array<str>;
        required reason: SignInReason;
        signed_out: bool {
            default := false;
        };

        constraint exclusive on (.user) except (.signed_out);
    }

    # N.B. make sure to update in forge/lib/constants
    scalar type SignInLocation extending enum<
        MAINSPACE,
        HEARTSPACE,
    >;

    type UserRegistration extending default::CreatedAt {
        required location: SignInLocation;
        required user: users::User;
    }

    type QueuePlace extending default::CreatedAt {
        required user: users::User {
            constraint exclusive;
        }
        required position: int16;
        required location: SignInLocation;
        required can_sign_in: bool {
            default := false;
        };
    }

    scalar type SignInReasonCategory extending enum<
        UNIVERSITY_MODULE,
        CO_CURRICULAR_GROUP,
        PERSONAL_PROJECT,
        SOCIETY,
        REP_SIGN_IN,
        EVENT,
    >;

    type SignInReason extending default::CreatedAt {
        required name: str {
            constraint exclusive;
        }
        required category: SignInReasonCategory;
        agreement: Agreement;
        index on ((.name));
    }

    type Agreement extending default::CreatedAt {
        multi reasons := (
            select SignInReason filter .agreement = __source__
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
