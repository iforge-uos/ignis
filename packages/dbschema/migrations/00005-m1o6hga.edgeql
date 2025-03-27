CREATE MIGRATION m1o6hgafzumupv6m3kw5tte2vmmlll3xhkt7kodwvzz5np7iyt7mtq
    ONTO m1ry2qwuzmxvftcs2tizap6chn5zhoajyfqroezglbk4biiebeu27q
{
          ALTER TYPE sign_in::Agreement {
      DROP ACCESS POLICY admin_only;
  };
  ALTER TYPE sign_in::Location {
      DROP ACCESS POLICY desk_or_higher;
  };
  ALTER TYPE sign_in::QueuePlace {
      DROP ACCESS POLICY desk_or_higher;
      DROP ACCESS POLICY edit_self;
  };
  ALTER TYPE sign_in::Reason {
      DROP ACCESS POLICY desk_or_higher;
  };
  ALTER TYPE sign_in::SignIn {
      DROP ACCESS POLICY desk_or_higher;
      DROP ACCESS POLICY view_self;
  };
  ALTER TYPE sign_in::UserRegistration {
      DROP ACCESS POLICY desk_or_higher;
  };
  ALTER TYPE training::Answer {
      DROP ACCESS POLICY everyone;
      DROP ACCESS POLICY h_and_s_or_higher;
  };
  ALTER TYPE training::Interactable {
      DROP ACCESS POLICY desk_or_higher_edit;
      DROP ACCESS POLICY everyone;
  };
  ALTER TYPE training::Session {
      DROP ACCESS POLICY allow_self;
  };
  ALTER TYPE training::Training {
      DROP ACCESS POLICY allow_reps_view_rep;
      DROP ACCESS POLICY desk_or_higher_edit;
      DROP ACCESS POLICY everyone;
      DROP ACCESS POLICY select_if_completed_basic;
  };
  ALTER TYPE users::Infraction {
      DROP ACCESS POLICY desk_or_higher;
  };
  ALTER TYPE users::User {
      DROP ACCESS POLICY rep_or_higher;
      DROP ACCESS POLICY view_self;
  };
};
