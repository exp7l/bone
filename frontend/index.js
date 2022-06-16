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

/*
    # Questions

    - Why are buy and sell not working?
    - Why RC-DAI_ADDRESS rate wrong?
    - Why gas estimation work sometimes sometimes not on metamask?
    - Make the Detail button not the row clickable
    - Break Detail into 2 rows
    - How does XSS work?
    - What does "use strict" do?
    - How to make contracts read only for safety?
    - How to do no connection only mode?
    - How to design for the swap expericence? 2 trades between daiStableS

    # Documentation

    # Terminologies

*/

/*
      # Main
*/
globalThis.onload = async function onLoad() {
  if (!isES2020Supported()) {
    const message = 'ES2020 not supported, please update your browser to the latest version.';
    alert(message);
    throw new Error(message);
  }

  let state = {};
  state = Object.assign(state, await requireConnection());
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
