import allowedChains from './configs.js'
import { registerWallet } from './handlers.js'

const { ethers } = globalThis

export async function requestAccounts() {
  const provider = new ethers.providers.Web3Provider(globalThis.ethereum)
  const method   = 'eth_requestAccounts'
  const params   = []
  await p.send(method, params)
}

export async function requestConnection() {
  const network       = await ( new ethers.providers.Web3Provider(globalThis.ethereum, 'any') ).getNetwork()
  if (![ 31337 ].includes(network.chainId)) throw new Error('Network not supported.')
  const signer        = provider.getSigner()
  const signerAddress = await signer.getAddress(0)
  return { provider, signer, signerAddress, network, }
}

/* Appendix

# Accounts

(Stagnant) Proposal to standardize the use of eth_accounts: https://eips.ethereum.org/EIPS/eip-1102
Provider standardization: https://eips.ethereum.org/EIPS/eip-1193.
Web3Provider wraps an EIP-1193 Provider which globalThis.ethereum is by convention: https://docs.ethers.io/v5/api/providers/other/#Web3Provider
Metamask's docs: https://docs.metamask.io/guide/rpc-api.html#restricted-methods
Brave Wallet's docs: https://wallet-docs.brave.com/ethereum/provider-api/methods

# Connection

FIXME: Should it return only 1 account even when multiple accounts are connected?
"If network is any...we auto-detect the current network."
https://github.com/ethers-io/ethers.js/blob/01aea705ce60b1c42d2f465b162cb339a0e94392/packages/providers/src.ts/base-provider.ts#L752
*/
