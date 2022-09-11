import { ethers } from "hardhat";
import { VRFCoordinatorV2Mock, RandomNumbers } from "../typechain-types";
import fs from "fs";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

interface Data {
    time: number;
    numbers: number[];
}

async function main() {
    const accounts = await ethers.getSigners();
    const requestor = accounts[1];
    const vrfMock: VRFCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        requestor
    );
    const randomNumbers: RandomNumbers = await ethers.getContract(
        "RandomNumbers",
        requestor
    );

    const requests = 5e5;
    let counter = 0;
    while (counter < requests) {
        const subscription = await vrfMock.getSubscription(1);
        const balance = subscription.balance;
        console.log(`The subscription balance is: ${balance.toString()}`);
        const requestTx = await randomNumbers.requestRandomNumber();
        const requestTxReceipt = await requestTx.wait(1);
        const requestId = requestTxReceipt.events![1].args!.requestId;
        console.log(`Requesting numbers with request id: ${requestId}`);
        await new Promise<void>(async (resolve, reject) => {
            randomNumbers.once("RandomNumbersReceived", async function () {
                console.log("Receiving numbers ...");
                try {
                    const timeStamp = Math.floor(Date.now() / 1000);
                    const numbers = await randomNumbers.getRequestIdToNumbers(
                        requestId
                    );
                    let convertedNumbers: number[] = new Array();
                    for (var i = 0; i < numbers.length; i++) {
                        convertedNumbers.push(numbers[i].toNumber());
                    }
                    const record: Data = {
                        time: timeStamp,
                        numbers: convertedNumbers,
                    };
                    const path = "numberRecords.json";
                    const currentData: any = JSON.parse(
                        fs.readFileSync(path, "utf-8")
                    );
                    currentData[requestId] = record;
                    fs.writeFileSync(path, JSON.stringify(currentData));
                    resolve();
                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            });
            await vrfMock.fulfillRandomWords(requestId, randomNumbers.address);
        });
        counter += 1;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
