module training {
    scalar type LocationName extending enum<
        MAINSPACE,
        HEARTSPACE,
        GEORGE_PORTER,
    >;

    scalar type Selectability extending enum<
        NO_TRAINING,
        REVOKED,
        EXPIRED,
        REPS_UNTRAINED,
        IN_PERSON_MISSING,
    >;

    type Training extending default::Auditable {
        required name: str;

        # things for the training app
        required enabled: bool {
            default := true;
        }
        required description: str;
        training_lockout: duration;
        multi pages: TrainingPage;
        multi questions: Question;
        # should be required multi
        multi sections := (  # polymorphism my beloved
            select .pages union .questions
            order by .index
        );
        icon_url: str;

        # things for the UI
        multi locations: LocationName;
        required compulsory: bool {
            default := false;
        }
        required in_person: bool {
            annotation description := "Whether this training requires in person training."
        }
        rep: Training {
            annotation description := "The associated training that reps should have to supervise this. Empty if the training is for reps."
        }
        expires_after: duration;

        # multi history: Training {
        #     # @reset_training: bool {
        #     #     annotation description := "Whether this was a large enough change to "
        #     # }
        #     annotation description := "We keep track of these for the edit functionality."
        #     rewrite update using (

        #     )
        # }

        index fts::index on (
            fts::with_options(
                .name,
                language := fts::Language.eng
            )
        );
        constraint exclusive on ((.name, .rep));


    }

    abstract type Interactable {
        required parent: Training;  # edgedb/edgedb#7209
        # required parent := (
        #     select assert_exists(assert_single(Training filter __subject__ in .sections))
        # }  # ideal solution is a compute but we need this now
        required index: int16;
        required content: str;
        required enabled: bool {
            default := true;
        }
        constraint exclusive on ((.parent, .index));

    }

    type TrainingPage extending Interactable {
        required name: str;
        duration: duration;
    }

    alias Page := TrainingPage;

    scalar type AnswerType extending enum<
        `SINGLE`,
        MULTI,
    >;

    type Question extending Interactable {
        required type: AnswerType;
        required multi answers: Answer;
    }

    type Answer {
        required content: str;
        required correct: bool {
            default := false;
        }
        description: str {
            annotation description := "The text shown after a user passes their answer giving a lil' explanation about whatever they said."
        }

    }

    type Session extending default::Auditable {
        required user: users::User;
        required training: Training;
        required index: int16 {
            annotation description := "The `Interactable.index` for the section user is currently on.";
            default := 0;
        }
        constraint exclusive on ((.user, .training));  # must be kept inline with TrainingService.startTraining's unlessConflict

    }
}