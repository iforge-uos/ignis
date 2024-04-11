import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { CreateUserSchema } from "@dbschema/edgedb-zod/modules/users";
import { Test, TestingModule } from "@nestjs/testing";
import { z } from "zod";

describe("UsersController", () => {
  let controller: UsersController;
  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should create a user", async () => {
    const dto: z.infer<typeof CreateUserSchema> = {
      username: "test",
      first_name: "John",
      last_name: "Doe",
      // user_agreement_version: 1,
      email: "jdoe1@sheffield.ac.uk",
      ucard_number: 1234567,
      organisational_unit: "Test",
    };
    mockUsersService.create.mockResolvedValue(dto);
    expect(await controller.create(dto)).toEqual(dto);
  });

  // Add other test cases for findAll, findOne, update, and remove...
});
