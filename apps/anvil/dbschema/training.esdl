module training {
    scalar type TrainingLocation extending enum<
        MAINSPACE,
        HEARTSPACE,
        GEORGE_PORTER,
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
        multi locations: TrainingLocation;
        required compulsory: bool {
            default := false;
        }
        required in_person: bool {
            annotation description := "Whether this training requires in person training."
        }
        rep: Training {
            annotation description := "Empty if the training is for reps."
        }
        expires_after: duration;

        index fts::index on (
            fts::with_options(
                .name,
                language := fts::Language.eng
            )
        );
        constraint exclusive on ((.name, .rep));
    }

    abstract type Interactable {
        # required parent := (
        #     select assert_exists(Training filter __source__ in .sections)
        # );  # ideal solution which doesn't require hard link
        required index: int16;
        required content: str;
        required enabled: bool {
            default := true;
        }
        # constraint exclusive on ((.parent, .index));  # FIXME open edgedb issue for this
        # TODO consider adding stats? e.g. failure rate
    }

    type TrainingPage extending Interactable {
        required name: str;
        duration: duration;
    }

    scalar type AnswerType extending enum<
        `SINGLE`,
        MULTI,
    >;

    type Question extending Interactable {
        required type: AnswerType;
        multi answers: Answer;
    }

    type Answer {
        required content: str;
        required correct: bool {
            default := false;
        }
        description: str {
            annotation description := "The text shown after a user passes their answer giving a lil' explaination about whatever they said."
        }
    }

    type UserTrainingSession extending default::Auditable {
        required user: users::User;
        required training: Training;
        required index: int16 {
            annotation description := "The `Interactable.index` for the section user is currently on.";
            default := 0;
        }
        constraint exclusive on ((.user, .training));  # must be kept inline with TrainingService.startTraining's unlessConflict
    }
}