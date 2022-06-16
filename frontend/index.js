import isES2020Supported from './compatibility.js';
import fetchInputs from './fetch.js';
import contracts from './contract-init.js';

import {
  drawRoot,
} from './draw.js';

import {
  registerRoot,
} from './handlers.js';

import {
  requireConnection,
  requestAccounts,
} from './provider.js';

globalThis.onload = async function onLoad() {
  if (!( typeof globalThis !== 'undefined' )) throw new Error('ES2020 not supported, please update your browser.');

  let state = {};
  state = Object.assign(state, await requestConnection());
  state = Object.assign(state, await fetchInputs());

  // FIX: Can we use Default Provider?
  state = Object.assign(state, contracts(state));

  // Make state hierarchical for simplier queries.
  state = {
    address: {
      signerAddress: state.signerAddress,
    },
    stableIDs: state.stableIDs,
    ethers: {
      provider: state.provider,
      signer: state.signer,
      requestAccounts,
    },
    contract: {
      stables: state.stables,
      rights: state.rights,
      stablesRO: state.stablesRO,
      rightsRO: state.rightsRO,
      dai: state.dai,
    },
    network: state.network,
  };

  registerRoot(state);
  drawRoot(state);
};
