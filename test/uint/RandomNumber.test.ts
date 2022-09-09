import { assert, expect } from "chai";
import { ethers, network, deployments } from "hardhat";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { VRFCoordinatorV2Mock, RandomNumbers } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandombNumbers", function () {
          let vrfMock: VRFCoordinatorV2Mock;
          let randomNumbers: RandomNumbers;
          let deployer: SignerWithAddress;
          let chainId: number;
          this.beforeEach(async function () {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              chainId = network.config.chainId!;
              await deployments.fixture(["all"]);
              vrfMock = await ethers.getContract(
                  "VRFCoordinatorV2Mock",
                  deployer
              );
              randomNumbers = await ethers.getContract(
                  "RandomNumbers",
                  deployer
              );
          });

          describe("constructor", function () {
              it("Assigns VRFCoordinator", async function () {
                  const vrfMockAddressFromContract =
                      await randomNumbers.getVrfCoordinator();
                  assert.equal(vrfMock.address, vrfMockAddressFromContract);
              });
          });

          describe("requestRandomNumber", function () {
              it("Emits random number requested event", async function () {
                  const txResponse = await randomNumbers.requestRandomNumber();
                  const txReceipt = await txResponse.wait(1);
                  const requestId = txReceipt.events![1].args!.requestId;
                  const requestor = txReceipt.events![1].args!.requestor;
                  assert.equal(requestId.toNumber(), 1);
                  assert.equal(requestor, deployer.address);
              });
          });

          describe("fulfillRandomWords", function () {
              it("Fulfills random number request", async function () {
                  await new Promise<void>(async (resolve, reject) => {
                      randomNumbers.once(
                          "RandomNumbersReceived",
                          async function () {
                              console.log("Random numbers received!");
                              try {
                                  resolve();
                              } catch (error) {
                                  reject(error);
                              }
                          }
                      );
                      const tx = await randomNumbers.requestRandomNumber();
                      const txReceipt = await tx.wait(1);
                      const requestId = txReceipt.events![1].args!.requestId;
                      await vrfMock.fulfillRandomWords(
                          requestId,
                          randomNumbers.address
                      );
                  });
              });
          });
      });
