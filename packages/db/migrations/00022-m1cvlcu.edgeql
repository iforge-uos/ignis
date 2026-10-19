CREATE MIGRATION m1f5hs4eubzrqjrpgmqkzcnnrfb24bycjiybdrvlftdc3yhsrfapzq
    ONTO m1oejadlv2edv75kovr4wkriem4272nikiowo6gahlg447wqopebia
{
  CREATE TYPE users::AccessibilityNote EXTENDING default::CreatedAt {
      CREATE REQUIRED LINK user: users::User;
      CREATE ACCESS POLICY admin_only_write
          ALLOW UPDATE, DELETE, INSERT USING (EXISTS (({'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only admins can manage accessibility notes';
          };
      CREATE ACCESS POLICY rep_or_higher_read
          ALLOW SELECT USING (EXISTS (({'Rep', 'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only reps can view accessibility notes';
          };
      CREATE ANNOTATION std::description := 'Free-text accessibility needs shown to reps when the user signs in.';
      CREATE REQUIRED PROPERTY content: std::str;
  };
  ALTER TYPE users::User {
      CREATE MULTI LINK accessibility_notes := (.<user[IS users::AccessibilityNote]);
  };
};
