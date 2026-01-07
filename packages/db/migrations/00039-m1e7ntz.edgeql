CREATE MIGRATION m1e7ntz5utcynrvumhbbgvwy32sp6ppxy7mhpjvpxxfmn77bsvmtmq
    ONTO m1rilhkudsrkzymemr2c2sexsqbraamhhbzv5ninh7ynz4vkuiuguq
{
  ALTER TYPE tools::Tool {
      CREATE REQUIRED PROPERTY status: tuple<code: tools::Status, reason: std::str> {
          SET REQUIRED USING ((
              code := tools::Status.NOMINAL,
              reason := ''
          ));
      };
  };
  ALTER TYPE tools::Booking {
      CREATE ACCESS POLICY is_bookable
          ALLOW UPDATE, INSERT USING ((.tool.is_bookable AND (.tool.status.code != tools::Status.OUT_OF_ORDER))) {
              SET errmessage := 'This tool is not currently bookable';
          };
  };
};
