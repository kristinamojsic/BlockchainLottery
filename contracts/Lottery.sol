// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Lottery {
    address payable[] public participants;
    // totalPrize is current balance
    address public owner;
    address payable winner;
    bool public isComplete;
    bool public claimed;
    uint256 public ticketPrize = 0.001 ether;

    event LotteryEntered(address indexed player);
    event PrizeClaimed(address indexed winner, uint256 amount);

    constructor() {
        owner = msg.sender;
        isComplete = false;
        claimed = false;
    }


    function getOwner() public view returns (address) {
        return owner;
    }

    function getWinner() public view returns (address) {
        return winner;
    }

    function status() public view returns (bool) {
        return isComplete;
    }

    function isClaimed() public view returns (bool)
    {
        return claimed;
    }
    function enter() public payable {
        require(msg.value >= ticketPrize,"Insufficient funds.");
        require(!isComplete,"Lottery has ended.");
        participants.push(payable(msg.sender));
        emit LotteryEntered(msg.sender);
    }

    modifier restricted() {
        require(msg.sender == owner,"Ownable: caller is not the owner");
        _;
    }
    
    function randomNumber() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, participants.length)));
    }
    
    function pickWinner() public restricted {
        require(participants.length > 0, "No participants.");
        require(!isComplete,"Lottery has ended.");
        winner = participants[randomNumber() % participants.length];
        isComplete = true;
    }

    function claimPrize() public {
        require(msg.sender == winner,"You are not the winner.");
        winner.transfer(address(this).balance);
        claimed = true;
        emit PrizeClaimed(winner, address(this).balance);
    }
    function getPlayers() public view returns (address payable[] memory) {
        return participants;
    }
}
