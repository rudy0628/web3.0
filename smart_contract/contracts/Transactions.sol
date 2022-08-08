//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Transactions {
  // Create transaction count
  uint256 transactionCount;

  // Create transaction event
  event Transfer(address from, address receiver, uint amount, string message, uint256 timestamp, string keyword);

  // Create Transfer struct
  struct TransferStruct {
    address sender;
    address receiver;
    uint amount;
    string message;
    uint256 timestamp;
    string keyword;
  }

  // Create transactions array
  TransferStruct[] transactions;

  // add to blockchain
  function addToBlockchain(address payable receiver, uint amount, string memory message, string memory keyword) public {
    transactionCount += 1;
    // push to array
    transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword));

    // emit the transfer function
    emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
  }

  function getAllTransactions() public view returns (TransferStruct[] memory) {
    return transactions;
  }

  function getTransactionCount() public view returns (uint256) {
    return transactionCount;
  }
}