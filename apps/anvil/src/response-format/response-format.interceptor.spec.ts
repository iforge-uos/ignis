import { ResponseFormatService } from "@/response-format/response-format.service";
import { Test, TestingModule } from "@nestjs/testing";
import { of } from "rxjs";
import { ResponseFormatInterceptor } from "@/response-format/response-format.interceptor";

describe("IforgeResponseInterceptor", () => {
  let interceptor: ResponseFormatInterceptor;
  let mockResponseFormatService: any;

  beforeEach(async () => {
    mockResponseFormatService = {
      formatResponse: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponseFormatInterceptor,
        {
          provide: ResponseFormatService,
          useValue: mockResponseFormatService,
        },
      ],
    }).compile();

    interceptor = module.get<ResponseFormatInterceptor>(
      ResponseFormatInterceptor,
    );
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should format successful responses", () => {
    const mockExecutionContext: any = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
    };
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ message: "Success" })),
    };

    mockResponseFormatService.formatResponse.mockReturnValueOnce({
      status: "success",
    });

    const result = interceptor.intercept(
      mockExecutionContext,
      mockCallHandler as any,
    );

    result.subscribe((res) => {
      expect(mockResponseFormatService.formatResponse).toHaveBeenCalledWith(
        200,
        { message: "Success" },
      );
      expect(res.status).toBe("success");
    });
  });

  // ... Additional tests for different scenarios can be added here.
});
