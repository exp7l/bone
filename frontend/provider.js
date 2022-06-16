import allowedChains from './configs.js';
import {
  registerWallet,
} from './handlers.js';

const { ethers } = globalThis;

export const requestAccounts = async function requestAccounts() {
  // (Stagnant) Proposal to standardize the use of eth_accounts: https://eips.ethereum.org/EIPS/eip-1102
  // Provider standardization: https://eips.ethereum.org/EIPS/eip-1193.
  // Web3Provider wraps an EIP-1193 Provider which globalThis.ethereum is by convention: https://docs.ethers.io/v5/api/providers/other/#Web3Provider
  // Metamask's docs: https://docs.metamask.io/guide/rpc-api.html#restricted-methods
  // Brave Wallet's docs: https://wallet-docs.brave.com/ethereum/provider-api/methods
  const provider = new ethers.providers.Web3Provider(globalThis.ethereum);
  const rpcMethodName = 'eth_requestAccounts';
  const rpcMethodParams = [];
  await provider.send(rpcMethodName, rpcMethodParams);
  globalThis.location.reload();
};

export const requireConnection = async function requireConnection() {
  // FIX: Returns only 1 account even when multiple accounts are connected?
  try {
    // "If network is any, this Provider allows the underlying
    // network to change dynamically, and we auto-detect the
    // current network."
    // https://github.com/ethers-io/ethers.js/blob/01aea705ce60b1c42d2f465b162cb339a0e94392/packages/providers/src.ts/base-provider.ts#L752
    const networkName = 'any';
    const provider = new ethers.providers.Web3Provider(globalThis.ethereum, networkName);
    const network = await provider.getNetwork();
    if (!allowedChains.includes(network.chainId)) {
      throw new Error('Network not supported.');
    }
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress(0);
    return {
      provider,
      signer,
      signerAddress,
      network,
    };
  } catch (error) {
    registerWallet();
    const MSG = `Please install or connect to an Ethereum wallet on a supported network. \`error\`=${error.toString()}`;
    alert(MSG);
    throw new Error(MSG);
  }
};
