CREATE MIGRATION m17q4qvf66ftijtdy3tchfo6ausc5wyud7ggc4ffnulvni4ckofq3q
    ONTO m1jf3piha2azx2oajs4efriawjwstpqiwgskmytiltwk4epf7mla4a
{
      ALTER TYPE training::Question {
      ALTER LINK answers {
          SET REQUIRED USING (<training::Answer>{});
      };
  };
  ALTER TYPE training::Training {
      ALTER LINK rep {
          ALTER ANNOTATION std::description := 'The associated training that reps should have to supervise this. Empty if the training is for reps.';
      };
      CREATE PROPERTY icon_url: std::str;
  };
};
