import { SeederService } from "./seeder.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("SeederService", () => {
  let service: SeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeederService],
    }).compile();

    service = module.get<SeederService>(SeederService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
