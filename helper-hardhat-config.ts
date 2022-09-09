interface NetworkConfigInfo {
    [chainId: number]: NetworkConfigItem;
}

type NetworkConfigItem = {
    gasLane?: string;
    subscriptionId?: string;
    callbackGasLimit?: string;
    blockConfirmations?: number;
    vrfCoordinatorV2Address?: string;
};

export const networkConfig: NetworkConfigInfo = {
    31337: {
        gasLane:
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "",
        callbackGasLimit: "500000",
        blockConfirmations: 1,
    },
    4: {
        gasLane:
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "0",
        callbackGasLimit: "500000",
        blockConfirmations: 6,
        vrfCoordinatorV2Address: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    },
};

export const developmentChains = ["hardhat", "localhost"];
