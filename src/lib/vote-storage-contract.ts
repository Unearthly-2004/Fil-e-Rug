export const VOTE_STORAGE_CONTRACT_ADDRESS = "0x3e0713d099145499df55f0dc083cfdd909162e54";

export const VOTE_STORAGE_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "cid", "type": "string" }
    ],
    "name": "submitVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "cid", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "voter", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "VoteStored",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "index", "type": "uint256" }
    ],
    "name": "getVote",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVoteCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "votes",
    "outputs": [
      { "internalType": "string", "name": "cid", "type": "string" },
      { "internalType": "address", "name": "voter", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]; 