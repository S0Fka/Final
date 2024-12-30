import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  let yourContract: YourContract;
  let owner: any;
  let addr1: any;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();

    const YourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = await YourContractFactory.deploy(owner.address);
    await yourContract.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy correctly and set the owner", async function () {
      expect(await yourContract.owner()).to.equal(owner.address);
    });
  });

  describe("Bill Creation", function () {
    it("Should allow creating a new bill", async function () {
      const amount = ethers.utils.parseEther("1.0"); // 1 ETH
      const dueDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // Время через сутки (timestamp)

      // Создаем новый счет
      await yourContract.createBill(amount, dueDate);

      // Получаем счет по индексу
      const bill = await yourContract.getBill(0);

      // Проверяем, что счет был создан правильно
      expect(bill.amount).to.equal(amount);
      expect(bill.dueDate).to.equal(dueDate);
      expect(bill.paid).to.equal(false);
    });
  });

  describe("Bill Payment", function () {
    it("Should allow paying a bill", async function () {
      const amount = ethers.utils.parseEther("1.0"); // 1 ETH
      const dueDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // Время через сутки (timestamp)

      // Создаем новый счет
      await yourContract.createBill(amount, dueDate);

      // Платим за счет
      await yourContract.connect(addr1).payBill(0, { value: amount });

      // Проверяем, что счет был оплачен
      const bill = await yourContract.getBill(0);
      expect(bill.paid).to.equal(true);
    });

    it("Should revert if not enough funds to pay the bill", async function () {
      const amount = ethers.utils.parseEther("1.0"); // 1 ETH
      const dueDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // Время через сутки (timestamp)

      // Создаем новый счет
      await yourContract.createBill(amount, dueDate);

      // Пробуем оплатить счет с недостаточной суммой
      await expect(
        yourContract.connect(addr1).payBill(0, { value: ethers.utils.parseEther("0.5") }),
      ).to.be.revertedWith("Insufficient funds to pay the bill");
    });
  });

  describe("Bill Listing", function () {
    it("Should allow fetching all bills for a user", async function () {
      const amount = ethers.utils.parseEther("1.0"); // 1 ETH
      const dueDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // Время через сутки (timestamp)

      // Создаем два счета
      await yourContract.createBill(amount, dueDate);
      await yourContract.createBill(amount, dueDate);

      // Получаем все счета для владельца
      const bills = await yourContract.getUserBills(owner.address);

      // Проверяем, что количество счетов верное
      expect(bills.length).to.equal(2);
    });

    it("Should return empty if no bills exist", async function () {
      const bills = await yourContract.getUserBills(owner.address);
      expect(bills.length).to.equal(0);
    });
  });
});
