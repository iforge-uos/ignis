import { EmailExceptionFilter } from "./email.filter";

describe("EmailFilter", () => {
  it("should be defined", () => {
    expect(new EmailExceptionFilter()).toBeDefined();
  });
});
