import {
  objectify,
} from './utils.js';

import {
  stableCoinAddress,
} from './contract-calls.js';

const { ethers } = globalThis;

const contract = function contract(address, abi, signer) {
  return new ethers.Contract(address, abi, signer);
};

const stableContracts = function stableContracts(stableIDs, stableABI, rights, signer) {
  return objectify(
    stableIDs,
    (stableID) => stableID,
    (stableID) => contract(stableCoinAddress(rights[stableID]), stableABI, signer),
  );
};

const rightContracts = function rightContracts(pipAddresses, rightABI, signer) {
  return {
    dEUR: contract(pipAddresses['EUR-USD'], rightABI, signer),
    dJPY: contract(pipAddresses['JPY-USD'], rightABI, signer),
    dGBP: contract(pipAddresses['GBP-USD'], rightABI, signer),
    dCNY: contract(pipAddresses['CNY-USD'], rightABI, signer),
    dINR: contract(pipAddresses['INR-USD'], rightABI, signer),
    dCHF: contract(pipAddresses['CHF-USD'], rightABI, signer),
    dBRL: contract(pipAddresses['BRL-USD'], rightABI, signer),
    dPHP: contract(pipAddresses['PHP-USD'], rightABI, signer),
    dXAU: contract(pipAddresses['XAU-USD'], rightABI, signer),
    dXAG: contract(pipAddresses['XAG-USD'], rightABI, signer),
    dWTI: contract(pipAddresses['WTI-USD'], rightABI, signer),
  };
};

export default function contracts({
  daiABI,
  stableABI,
  rightABI,
  daiAddress,
  pipAddresses,
  signer,
  provider,
}) {
  const rights = rightContracts(pipAddresses, rightABI, signer);
  const rightsRO = rightContracts(pipAddresses, rightABI, provider);
  const stableIDs = Object.keys(rights);
  return {
    dai: contract(daiAddress, daiABI, signer),
    stables: stableContracts(stableIDs, stableABI, rights, signer),
    stablesRO: stableContracts(stableIDs, stableABI, rightsRO, provider),
    stableIDs,
    rights,
    rightsRO,
  };
}
