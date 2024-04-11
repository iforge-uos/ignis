import { IntegrationsService } from "./integrations.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("IntegrationsService", () => {
  let service: IntegrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntegrationsService],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
