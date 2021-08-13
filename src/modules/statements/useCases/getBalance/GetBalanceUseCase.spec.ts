import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeAll(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("should not be able to get a nonexistent user's balance", async () => {
    expect(async () => {
      const user_id = "nonexisting user";
      await getBalanceUseCase.execute({ user_id });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

  it("should be able to get an user's balance", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User test",
      email: "test@test.com",
      password: "123456",
    });

    const balance = await getBalanceUseCase.execute({ user_id: user.id });

    expect(balance.balance).toBe(0);
    expect(balance.statement.length).toBe(0);
  });
});
