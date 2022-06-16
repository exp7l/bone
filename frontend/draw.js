import {
  afterFeeBuy,
  afterFeeSell,
  balance,
  price,
  symbol,
  totalSupply,
  priceBuy,
  equityPerToken,
  reserveMultipleMin,
  reserveBalance,
  reserveRatio,
} from './contract-calls.js';

import { toWAD } from './utils.js';

// TODO: Wrap all the DOM APIs here - including read calls like document.<methodName> etc.

const element = function element(tagName, ...objects) {
  return Object.assign.apply(null, [document.createElement(tagName)].concat(objects));
};

const drawWallet = async function drawWallet({
  addressEID,
  balanceEID,
  chainEID,
  address: { signerAddress },
  contract: { dai },
  network,
}) {
  const signerDAIBalance = balance(dai, signerAddress);
  document.getElementById(addressEID).textContent = signerAddress;
  document.getElementById(balanceEID).textContent = `${await signerDAIBalance}`;
  document.getElementById(chainEID).textContent = `${network.chainId} (${network.name})`;
};

const infoRow = function infoRow(propText, valueText) {
  const row = element('tr');
  row.append(
    element('th', { textContent: propText }),
    element('td', { textContent: valueText }),
  );
  return row;
};

const drawListRow = async function drawListRow(state) {
  const {
    stableID,
    contract: { stablesRO, rightsRO },
    address: { signerAddress },
  } = state;
  const [
    stableBalance,
    stablePrice,
    rightSymbol,
    rightBalance,
    rightPriceBuy,
    rightEquityPerToken,
  ] = await Promise.all([
    balance(stablesRO[stableID], signerAddress),
    price(stablesRO[stableID]),
    symbol(rightsRO[stableID]),
    balance(rightsRO[stableID], signerAddress),
    priceBuy(rightsRO[stableID]),
    equityPerToken(rightsRO[stableID]),
  ]);
  const row = element('tr', { id: stableID });
  row.append(
    element('th', { textContent: stableID }),
    element('td', { textContent: stableBalance }),
    element('td', { textContent: stablePrice }),
    element('th', { textContent: rightSymbol }),
    element('td', { textContent: rightBalance }),
    element('td', { textContent: rightPriceBuy }),
    element('td', { textContent: rightEquityPerToken }),
  );
  document.getElementById(stableID).replaceWith(row);
};

export const animateProgress = function animateProgress(domElement, action) {
  const progressClass = 'spinner';
  domElement.classList.add(progressClass);
  action();
  globalThis.setTimeout(
    () => {
      domElement.classList.remove(progressClass);
      document.activeElement.blur();
    },
    1000,
  );
};

export const drawStableInfo = async function drawStableInfo({
  contract: { stablesRO },
  stableID,
  address: { signerAddress },
  targetEID,
}) {
  const stableContract = stablesRO[stableID];
  const [
    stableSymbol,
    stableBalance,
    stablePrice,
    stableAfterFeeBuy,
    stableAfterFeeSell,
    stableTotalSupply,
    stableReserveMultipleMin,
    stableReserveRatio,
    stableReserveBalance,
    stableAddress,
  ] = await Promise.all([
    symbol(stableContract),
    balance(stableContract, signerAddress),
    price(stableContract),
    afterFeeBuy(stableContract, toWAD('1')),
    afterFeeSell(stableContract, toWAD('1')),
    totalSupply(stableContract),
    reserveMultipleMin(stableContract),
    reserveRatio(stableContract),
    reserveBalance(stableContract),
    stableContract.address,
  ]);
  const table = element('table');
  table.append(
    infoRow('SYMBOL', stableSymbol),
    infoRow('BALANCE', stableBalance),
    infoRow('STABLECOIN-DAI RATE', stablePrice),
    infoRow('STABLECOIN-DAI BUY RATE (FEES IN)', stableAfterFeeBuy),
    infoRow('STABLECOIN-DAI SELL RATE (FEES IN)', stableAfterFeeSell),
    infoRow('CIRCULATION', stableTotalSupply),
    infoRow('MIN RESERVE RATIO', stableReserveMultipleMin),
    infoRow('CURRENT RESERVE RATIO', stableReserveRatio),
    infoRow('RESERVE (DAI)', stableReserveBalance),
    infoRow('CODE', stableAddress),
  );
  const div = element('div', { id: targetEID });
  div.append(table);
  document.getElementById(targetEID).replaceWith(div);
};

export const drawRightInfo = async function drawRightInfo({
  contract: { rightsRO },
  rightID,
  address: { signerAddress },
  targetEID,
}) {
  const rightContract = rightsRO[rightID];
  const [
    stableSymbol,
    stableBalance,
    stablePrice,
    stableAfterFeeBuy,
    stableAfterFeeSell,
    stableTotalSupply,
    stableAddress,
  ] = await Promise.all([
    symbol(rightContract),
    balance(rightContract, signerAddress),
    priceBuy(rightContract),
    afterFeeBuy(rightContract, toWAD('1')),
    afterFeeSell(rightContract, toWAD('1')),
    totalSupply(rightContract),
    rightContract.address,
  ]);
  const table = element('table');
  table.append(
    infoRow('SYMBOL', stableSymbol),
    infoRow('BALANCE', stableBalance),
    infoRow('RIGHTCOIN-DAI RATE', stablePrice),
    infoRow('RIGHTCOIN-DAI BUY RATE (FEES IN)', stableAfterFeeBuy),
    infoRow('RIGHTCOIN-DAI SELL RATE (FEES IN)', stableAfterFeeSell),
    infoRow('CIRCULATION', stableTotalSupply),
    infoRow('CODE', stableAddress),
  );
  const div = element('div', { id: targetEID });
  div.append(table);
  console.log(`targetEID=${targetEID}`);
  document.getElementById(targetEID).replaceWith(div);
};

export const drawDAIInfo = async function drawDAIInfo(targetElementId) {
  const div = element('div', { textContent: 'DAI - NO CONTRACT DETAIL', id: targetElementId });
  div.classList.add('terminal-alert');
  document.getElementById(targetElementId).replaceWith(div);
};

export const drawListing = async function drawListing(state) {
  state.stableIDs.forEach((stableID) => drawListRow(Object.assign(state, { stableID })));
};

export const drawPageUpdateTime = function drawPageUpdateTime() {
  const now = new globalThis.Date();
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let date = now.getDate();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();
  if (month.toString().length === 1) {
    month = `0${month}`;
  }
  if (date.toString().length === 1) {
    date = `0${date}`;
  }
  if (hour.toString().length === 1) {
    hour = `0${hour}`;
  }
  if (minute.toString().length === 1) {
    minute = `0${minute}`;
  }
  if (second.toString().length === 1) {
    second = `0${second}`;
  }
  const DATETIME = `LAST PAGE REFRESH: ${year}-${month}-${date}T${hour}:${minute}:${second}`;
  document.getElementById('h1-trade').insertAdjacentText('beforebegin', DATETIME);
};

export const drawRoot = async function drawRoot(state) {
  drawPageUpdateTime();
  drawListing(state);
  drawWallet(Object.assign(state, { addressEID: 'label-address', balanceEID: 'label-balance', chainEID: 'label-chainid' }));
  drawStableInfo(Object.assign(state, { targetEID: 'stablecoin-detail-base', stableID: 'dEUR' }));
  drawStableInfo(Object.assign(state, { targetEID: 'stablecoin-detail-quote', stableID: 'dJPY' }));
  drawRightInfo(Object.assign(state, { targetEID: 'rightcoin-detail-base', rightID: 'dEUR' }));
  drawRightInfo(Object.assign(state, { targetEID: 'rightcoin-detail-quote', rightID: 'dJPY' }));
};
