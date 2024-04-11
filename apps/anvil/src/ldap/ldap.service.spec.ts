import { LdapService } from "./ldap.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("LdapService", () => {
  let service: LdapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LdapService],
    }).compile();

    service = module.get<LdapService>(LdapService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
