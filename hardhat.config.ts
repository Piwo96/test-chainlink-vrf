import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "hardhat-deploy";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            { version: "0.8.9" },
            { version: "0.8.4" },
            { version: "0.8.0" },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            chainId: 31337,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
    mocha: {
        timeout: 500000,
    },
};

export default config;
