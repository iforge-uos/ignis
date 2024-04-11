import { AuthorizationService } from "./authorization.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("AuthorizationService", () => {
  let service: AuthorizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizationService],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
