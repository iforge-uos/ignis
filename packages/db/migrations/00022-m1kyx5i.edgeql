CREATE MIGRATION m1kyx5ibmr46sl2yi5ks75xpwjqmb5ah3caxxuotllwarkxdfbnedq
    ONTO m13n7nfz5m2skho7w6i2nt2dh44s4rkrtwpywfxsw4olympj5jbrsq
{
  ALTER TYPE sign_in::SignIn {
      CREATE MULTI LINK _tools: (tools::GroupedTool | tools::Tool);
  };
};
