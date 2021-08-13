import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("GetStatementOperationUseCase", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should not be able to find statement from a nonexistent user", async () => {
    expect(async () => {
      const user_id = "nonexistent";
      const statement_id = "nonexistent";

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id,
      });
    }).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });

  it("should not be able to find one statement", async () => {
    expect(async () => {
      const { id: user_id } = await usersRepositoryInMemory.create({
        name: "User test",
        email: "test@test.com.br",
        password: "123456",
      });

      const statement_id = "nonexistent";

      await statementsRepositoryInMemory.findStatementOperation({
        user_id,
        statement_id,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  it("should be able to return one statement", async () => {
    const { id: user_id } = await usersRepositoryInMemory.create({
      name: "User test",
      email: "test@test.com.br",
      password: "123456",
    });

    const { id: statement_id } = await statementsRepositoryInMemory.create({
      user_id,
      description: "Test",
      amount: 1000,
      type: OperationType.DEPOSIT,
    });

    const statement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toBe(1000);
  });
});
