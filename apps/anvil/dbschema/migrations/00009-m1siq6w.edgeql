CREATE MIGRATION m1siq6wvdkeukxszitojmhhdwuwq5jd6ii2sl4577hc2sffvwg65nq
    ONTO m1ybcenpojhsrfh4pl2ugc3ijrrttsnzsmsvqxxc563opaeqsql3fa
{
  ALTER TYPE users::User {
      CREATE LINK infraction: users::Infraction;
  };
};
