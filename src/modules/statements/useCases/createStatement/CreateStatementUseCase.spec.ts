import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeAll(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to create a new statement", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User test",
      email: "test@teste.com",
      password: "123456",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Test",
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 200,
      description: "Test",
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to withdraw if the balance is insufficient", async () => {
    const { id: user_id } = await usersRepositoryInMemory.create({
      name: "User test",
      email: "teste@test.com.br",
      password: "123456",
    });

    await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "Test",
    });

    await expect(
      createStatementUseCase.execute({
        user_id,
        type: OperationType.WITHDRAW,
        amount: 1001,
        description: "Test",
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });


  it("should not be able to create a new statement for an nonexistent user", async () => {
    expect(async () => {
      const user_id = "nonexistent user";
      await createStatementUseCase.execute({
        user_id,
        type: OperationType.DEPOSIT,
        amount: 500,
        description: "Test",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
