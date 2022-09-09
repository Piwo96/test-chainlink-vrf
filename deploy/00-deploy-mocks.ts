import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const BASE_FEE = ethers.utils.parseEther("0.52");
const GAS_PRICE_LINK = 1e9;

const deployMocks: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { network, getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("Deploying mocks ...");
        const args: any = [BASE_FEE, GAS_PRICE_LINK];
        await deploy("VRFCoordinatorV2Mock", {
            contract: "VRFCoordinatorV2Mock",
            from: deployer,
            log: true,
            args: args,
        });
        log("Mocks deployed!");
        log("-----------------------------------");
    }
};

export default deployMocks;
deployMocks.tags = ["all", "mocks"];
