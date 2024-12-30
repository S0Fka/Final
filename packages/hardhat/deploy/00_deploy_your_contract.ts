import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployBillPaymentContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const contractArguments = [deployer];

  const deployment = await deploy("BillPayment", {
    from: deployer,
    args: contractArguments,
    log: true,
    autoMine: true,
  });

  const billPaymentContract = await hre.ethers.getContract<Contract>("BillPayment", deployer);

  try {
    console.log("👋 Initial greeting:", await billPaymentContract.greeting());
  } catch (error) {
    console.error("Error during interaction with the deployed contract:", error);
  }

  console.log(`Contract "BillPayment" deployed at address: ${deployment.address}`);
};

export default deployBillPaymentContract;

deployBillPaymentContract.tags = ["BillPayment"];
