import { SignInController } from "./sign-in.controller";
import { Test, TestingModule } from "@nestjs/testing";

describe("QueueController", () => {
  let controller: SignInController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignInController],
    }).compile();

    controller = module.get<SignInController>(SignInController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
