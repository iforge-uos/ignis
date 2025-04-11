CREATE MIGRATION m1xhcm22vg4cf7snia6zm5a3ork72zzjtuvweiivwl2lj7wzioqnya
    ONTO m1urhrdqrurxyuydqizgvmcivqb35zdagy3ltmi37pkmj6abz65eaa
{
  CREATE SCALAR TYPE notification::AllTargetTarget EXTENDING enum<ALL, REPS>;
  ALTER TYPE notification::AllTarget {
      ALTER PROPERTY target {
          DROP CONSTRAINT std::one_of('ALL', 'REPS');
          SET TYPE notification::AllTargetTarget;
      };
  };
};
