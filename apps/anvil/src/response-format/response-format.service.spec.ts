import { Test, TestingModule } from "@nestjs/testing";
import { ResponseFormatService } from "./response-format.service";

describe("ResponseFormatterService", () => {
  let service: ResponseFormatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseFormatService],
    }).compile();

    service = module.get<ResponseFormatService>(ResponseFormatService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
