import {
  animateProgress,
  drawDAIInfo,
  drawRightInfo,
  drawStableInfo,
} from './draw.js';

import {
  afterFeeBuy,
  afterFeeSell,
  mayApprove,
  buy,
  sell,
} from './contract-calls.js';

import {
  toWAD,
} from './utils.js';

const { ethers } = globalThis;
const daiSymbol = 'DAI';

const validbaseQuoteStyle = function validbaseQuoteStyle(baseElement, quoteElement) {
  const alertClass = 'terminal-alert-error';
  baseElement.classList.remove(alertClass);
  quoteElement.classList.remove(alertClass);
  if (baseElement.value === quoteElement.value) {
    baseElement.classList.add(alertClass);
    quoteElement.classList.add(alertClass);
  }
};

const tradeInputOnchangeFactory = function tradeInputOnchangeFactory({
  baseSymbolEID,
  quoteSymbolEID,
  quoteRateEID,
  baseAmountEID,
  quoteAmountEID,
  baseTargetEID,
  quoteTargetEID,
  contractsRO,
  signerAddress,
  drawFn,
}) {
  return (
    async function tradeInputOnchange() {
      const baseSymbolElement = document.getElementById(baseSymbolEID);
      const baseSymbol = baseSymbolElement.value;
      const quoteSymbolElement = document.getElementById(quoteSymbolEID);
      const quoteSymbol = quoteSymbolElement.value;
      const quoteRateElement = document.getElementById(quoteRateEID);
      const baseAmount = document.getElementById(baseAmountEID).value;
      const quoteAmountElement = document.getElementById(quoteAmountEID);
      const drawStableInfoWrapped = ({ assetID, targetEID }) => drawFn({
        contract: { stablesRO: contractsRO, rightsRO: contractsRO },
        rightID: assetID,
        stableID: assetID,
        address: { signerAddress },
        targetEID,
      });
      let baseRate;
      let quoteRate;

      validbaseQuoteStyle(baseSymbolElement, quoteSymbolElement);

      // Compute baseRate and quoteRate.
      if (baseSymbol === daiSymbol) {
        baseRate = 1;
        drawDAIInfo(baseTargetEID);
      } else {
        baseRate = await afterFeeSell(contractsRO[baseSymbol], toWAD('1'));
        drawStableInfoWrapped({ assetID: baseSymbol, targetEID: baseTargetEID });
      }
      if (quoteSymbol === daiSymbol) {
        quoteRate = 1;
        drawDAIInfo(quoteTargetEID);
      } else {
        quoteRate = await afterFeeBuy(contractsRO[quoteSymbol], toWAD('1'));
        drawStableInfoWrapped({ assetID: quoteSymbol, targetEID: quoteTargetEID });
      }

      // Update UI.
      const multiLegRate = baseRate * (1 / quoteRate);
      const multiLegAmount = multiLegRate * baseAmount;
      quoteRateElement.textContent = multiLegRate;
      quoteAmountElement.value = multiLegAmount;
    }
  );
};

const registerAssetsInfo = function registerAssetsInfo({
  baseSymbolEID,
  quoteSymbolEID,
  baseAmountEID,
  quoteAmountEID,
  quoteRateEID,
  baseTargetEID,
  quoteTargetEID,
  contractsRO,
  signerAddress,
  drawFn,
}) {
  const baseSymbolElement = document.getElementById(baseSymbolEID);
  const quoteSymbolElement = document.getElementById(quoteSymbolEID);
  const baseAmountElement = document.getElementById(baseAmountEID);
  const onchange = tradeInputOnchangeFactory({
    baseSymbolEID,
    quoteSymbolEID,
    quoteRateEID,
    baseAmountEID,
    quoteAmountEID,
    baseTargetEID,
    quoteTargetEID,
    contractsRO,
    signerAddress,
    drawFn,
  });
  baseSymbolElement.onchange = onchange;
  quoteSymbolElement.onchange = onchange;
  baseAmountElement.onchange = onchange;
};

const registerStableAssetsInfo = function registerStableAssetsInfo(
  stableContractsRO,
  signerAddress,
) {
  registerAssetsInfo({
    baseSymbolEID: 'base-symbol',
    quoteSymbolEID: 'quote-symbol',
    baseAmountEID: 'base-amount',
    quoteAmountEID: 'quote-amount',
    quoteRateEID: 'quote-rate',
    baseTargetEID: 'stablecoin-detail-base',
    quoteTargetEID: 'stablecoin-detail-quote',
    contractsRO: stableContractsRO,
    signerAddress,
    drawFn: drawStableInfo,
  });
};

const startTX = async function startTX({
  contracts,
  daiContract,
  signer,
  signerAddress,
  baseSymbolEID,
  quoteSymbolEID,
  baseAmountEID,
  quoteAmountEID,
}) {
  const baseSymbol = document.getElementById(baseSymbolEID).value;
  const quoteSymbol = document.getElementById(quoteSymbolEID).value;
  const baseAmount = document.getElementById(baseAmountEID).value;
  const quoteAmount = document.getElementById(quoteAmountEID).value;
  const quoteContract = contracts[quoteSymbol];
  const baseContract = contracts[baseSymbol];
  const buyQuoteAsset = async () => {
    await mayApprove(daiContract, signerAddress, quoteContract.address, signer);
    console.log(`toWAD(quoteAmount)=${toWAD(quoteAmount)}`);
    await buy(quoteContract, signer, toWAD(quoteAmount));
  };
  const sellBaseAsset = async () => {
    console.log(`toWAD(baseAmount)=${toWAD(baseAmount)}`);
    await sell(baseContract, signer, toWAD(baseAmount));
  };

  if (baseSymbol === daiSymbol && quoteSymbol.value !== daiSymbol) {
    await buyQuoteAsset();
  } else if (baseSymbol !== daiSymbol && quoteSymbol === daiSymbol) {
    await sellBaseAsset();
  } else {
    await sellBaseAsset();
    await buyQuoteAsset();
  }
};

const registerStableStartTx = function registerStableStartTx(
  stableContracts,
  daiContract,
  signerAddress,
  signer,
) {
  const startTXButton = document.getElementById('button-start-transaction');
  startTXButton.onclick = async () => {
    try {
      startTX({
        contracts: stableContracts,
        daiContract,
        signer,
        signerAddress,
        baseSymbolEID: 'base-symbol',
        quoteSymbolEID: 'quote-symbol',
        baseAmountEID: 'base-amount',
        quoteAmountEID: 'quote-amount',
      });
    } catch (error) {
      alert(JSON.stringify(error));
      console.log(error);
    }
  };
};

const registerStable = function registerStable(
  stableContractsRO,
  stableContracts,
  daiContract,
  signerAddress,
  signer,
) {
  registerStableAssetsInfo(stableContractsRO, signerAddress);
  registerStableStartTx(stableContracts, daiContract, signerAddress, signer);
};

const registerRightStartTx = function registerRightStartTx(
  rightContracts,
  daiContract,
  signerAddress,
  signer,
) {
  const startTXButton = document.getElementById('rightcoin-button-start-transaction');
  startTXButton.onclick = async () => {
    try {
      startTX({
        contracts: rightContracts,
        daiContract,
        signer,
        signerAddress,
        baseSymbolEID: 'rightcoin-base-symbol',
        quoteSymbolEID: 'rightcoin-quote-symbol',
        baseAmountEID: 'rightcoin-base-amount',
        quoteAmountEID: 'rightcoin-quote-amount',
      });
    } catch (error) {
      alert(JSON.stringify(error));
      console.log(error);
    }
  };
};

const registerRightAssetsInfo = function registerRightAssetsInfo(
  rightContractsRO,
  signerAddress,
) {
  registerAssetsInfo({
    baseSymbolEID: 'rightcoin-base-symbol',
    quoteSymbolEID: 'rightcoin-quote-symbol',
    baseAmountEID: 'rightcoin-base-amount',
    quoteAmountEID: 'rightcoin-quote-amount',
    quoteRateEID: 'rightcoin-quote-rate',
    baseTargetEID: 'rightcoin-detail-base',
    quoteTargetEID: 'rightcoin-detail-quote',
    contractsRO: rightContractsRO,
    signerAddress,
    drawFn: drawRightInfo,
  });
};

const registerRight = function registerRight(
  rightContractsRO,
  rightContracts,
  daiContract,
  signerAddress,
  signer,
) {
  registerRightAssetsInfo(rightContractsRO, signerAddress);
  registerRightStartTx(rightContracts, daiContract, signerAddress, signer);
};

const registerProviderEvents = function registerProviderEvents() {
  (new ethers.providers.Web3Provider(globalThis.ethereum, 'any')).on('network', (_, oldNetwork) => {
    // "When a Provider makes its initial connection, it emits a "network"
    // event with a null oldNetwork along with the newNetwork. So, if the
    // oldNetwork exists, it represents a changing network."
    // https://docs.ethers.io/v5/single-page/#/v5/concepts/best-practices/-%23-best-practices--network-changes
    if (oldNetwork) {
      globalThis.location.reload();
    }
  });
};

export const registerWallet = function registerWallet(requestAccounts) {
  const button = document.getElementById('button-wallet');
  // Request to connect to accounts via Ethers Provider .
  button.onclick = () => animateProgress(button, () => {
    console.log('Wallet\'s button clicked.');
    requestAccounts();
  });
};

export const registerRoot = function registerRoot({
  address: {
    signerAddress,
  },
  ethers: {
    signer,
    requestAccounts,
  },
  contract: {
    stablesRO,
    stables,
    rightsRO,
    rights,
    dai,
  },
}) {
  registerWallet(requestAccounts);
  registerProviderEvents();
  registerStable(stablesRO, stables, dai, signerAddress, signer);
  registerStable(stablesRO, stables, dai, signerAddress, signer);
  registerRight(rightsRO, rights, dai, signerAddress, signer);
  registerRight(rightsRO, rights, dai, signerAddress, signer);
};
