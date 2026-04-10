CREATE MIGRATION m16jycn2gouveamapphqhtgxmi4nycnb6chnrjxhn5zfytrfrx4laq
    ONTO m1e3ncebrxgycs2qaa5oweci55cex2bs6kmsquklfehwuj2b2zyu4q
{
  ALTER TYPE sign_in::QueuePlace EXTENDING default::Listenable LAST;
};
