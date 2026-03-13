import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@cofhe/hardhat-plugin";
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const accounts = PRIVATE_KEY && PRIVATE_KEY !== "your_private_key_here"
  ? [`0x${PRIVATE_KEY.replace(/^0x/, "")}`]
  : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts,
    },
    hardhat: {
      // @ts-expect-error -- hardhat-cofhe extends the config type
      cofhe: { enabled: true },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};

export default config;
