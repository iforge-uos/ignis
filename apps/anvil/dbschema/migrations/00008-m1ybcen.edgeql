CREATE MIGRATION m1ybcenpojhsrfh4pl2ugc3ijrrttsnzsmsvqxxc563opaeqsql3fa
    ONTO m1pdkqghj24izq3p2465ru2rq777bzqqiyz7hm5ljklqtebhzqwama
{
  ALTER SCALAR TYPE training::Selectability EXTENDING enum<NO_TRAINING, REVOKED, EXPIRED, REPS_UNTRAINED, IN_PERSON_MISSING>;
};
