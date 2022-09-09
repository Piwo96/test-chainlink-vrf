// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

contract RandomNumbers is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 6;

    // RequestId to numbers array
    mapping(uint256 => uint256[]) private s_requestIdToNumbers;

    event RandomNumbersRequested(
        address indexed requestor,
        uint256 indexed requestId
    );
    event RandomNumbersReceived(uint256 indexed requestId);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
    }

    function requestRandomNumber() external {
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RandomNumbersRequested(msg.sender, requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        uint256[] memory numbers = new uint256[](6);
        for (uint16 i = 0; i < randomWords.length; i++) {
            numbers[i] = randomWords[i] % 50;
        }
        s_requestIdToNumbers[requestId] = numbers;
        emit RandomNumbersReceived(requestId);
    }

    function getRequestIdToNumbers(uint256 requestId)
        public
        view
        returns (uint256[] memory)
    {
        return s_requestIdToNumbers[requestId];
    }

    function getVrfCoordinator()
        public
        view
        returns (VRFCoordinatorV2Interface)
    {
        return i_vrfCoordinator;
    }
}
