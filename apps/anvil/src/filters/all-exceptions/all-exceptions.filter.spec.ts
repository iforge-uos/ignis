import { ResponseFormatService } from "@/response-format/response-format.service";
import { AllExceptionsFilter } from "./all-exceptions.filter";
import { HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;
  let mockResponseFormatService: any;

  const mockArgumentsHost: any = {
    switchToHttp: jest.fn().mockReturnThis(),
    getResponse: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(async () => {
    mockResponseFormatService = {
      formatResponse: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: ResponseFormatService,
          useValue: mockResponseFormatService,
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  it("should be defined", () => {
    expect(filter).toBeDefined();
  });

  it("should handle NotFoundException", () => {
    const exception = new HttpException("Not Found", 404);
    mockResponseFormatService.formatResponse.mockReturnValueOnce({
      status: "error",
    }); // If you need more properties, add them here

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponseFormatService.formatResponse).toHaveBeenCalledWith(
      404,
      null,
      exception,
    );
    expect(mockArgumentsHost.status).toHaveBeenCalledWith(404);
    expect(mockArgumentsHost.json).toHaveBeenCalledWith(expect.any(Object)); // or more specific expectations
  });

  it("should handle generic errors", () => {
    const exception = new Error("Generic error");
    mockResponseFormatService.formatResponse.mockReturnValueOnce({
      status: "error",
    }); // If you need more properties, add them here

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponseFormatService.formatResponse).toHaveBeenCalledWith(
      500,
      null,
      exception,
    );
    expect(mockArgumentsHost.status).toHaveBeenCalledWith(500);
    expect(mockArgumentsHost.json).toHaveBeenCalledWith(expect.any(Object)); // or more specific expectations
  });
});
