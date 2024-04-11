import { Test, TestingModule } from "@nestjs/testing";
import { TrainingService } from "./TrainingService";

describe("TrainingService", () => {
  let service: TrainingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingService],
    }).compile();

    service = module.get<TrainingService>(TrainingService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
