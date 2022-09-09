import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const VRF_FUND_AMOUNT = ethers.utils.parseEther("100");

const deployRandomNumbers: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { network, getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId!;

    let vrfMock, vrfCoordinatorAddress, subscriptionId;

    if (developmentChains.includes(network.name)) {
        vrfMock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorAddress = vrfMock.address;
        const txResponse = await vrfMock.createSubscription();
        const txReceipt = await txResponse.wait(1);
        subscriptionId = txReceipt.events[0].args.subId;
        await vrfMock.fundSubscription(subscriptionId, VRF_FUND_AMOUNT);
    } else {
        vrfCoordinatorAddress = networkConfig[chainId].vrfCoordinatorV2Address!;
        subscriptionId = networkConfig[chainId].subscriptionId!;
    }

    const gasLane = networkConfig[chainId].gasLane!;
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit!;
    const waitConfirmations = networkConfig[chainId].blockConfirmations!;

    const args: any = [
        vrfCoordinatorAddress,
        subscriptionId,
        gasLane,
        callbackGasLimit,
    ];
    log("Args assigned!");
    const randomNumbers = await deploy("RandomNumbers", {
        contract: "RandomNumbers",
        from: deployer,
        log: true,
        waitConfirmations: waitConfirmations,
        args: args,
    });
    log(`RandomNumbers address: ${randomNumbers.address}`);
    log(`SubscriptionId: ${subscriptionId}`);
    log("RandomNumbers deployed!");

    if (developmentChains.includes(network.name)) {
        const vrfMock = await ethers.getContract("VRFCoordinatorV2Mock");
        await vrfMock.addConsumer(subscriptionId, randomNumbers.address);
    }
    log("Consumer added!");
    log("-----------------------------------");
};

export default deployRandomNumbers;
deployRandomNumbers.tags = ["all", "randomNumbers"];
