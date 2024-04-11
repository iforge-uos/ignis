import { SignInService } from "./sign-in.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("SignInService", () => {
  let service: SignInService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignInService],
    }).compile();

    service = module.get<SignInService>(SignInService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
