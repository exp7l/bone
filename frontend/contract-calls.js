/*
      # Utility
*/
const { ethers } = globalThis;

export const sendTx = async function sendTx(contract, signer, sig, args) {
  const TX = await contract.populateTransaction[sig].apply(null, args);
  return signer.sendTransaction(TX);
};

/*
      # Read Only
*/
export const afterFeeBuyRaw = async function afterFeeBuyRaw(contract, wad) {
  return contract['afterFeeBuy(uint256)'](wad);
};

export const afterFeeBuy = async function afterFeeBuy(contract, wad) {
  return (await afterFeeBuyRaw(contract, wad)) / 10 ** 18;
};

export const afterFeeSellRaw = async function afterFeeSellRaw(contract, wad) {
  return contract['afterFeeSell(uint256)'](wad);
};

export const afterFeeSell = async function afterFeeSell(contract, wad) {
  return (await afterFeeSellRaw(contract, wad)) / 10 ** 18;
};

export const allowance = async function allowance(contract, owner, spender) {
  return contract['allowance(address,address)'](owner, spender);
};

export const balance = async function balance(contract, address) {
  return (await contract['balanceOf(address)'](address)) / 10 ** 18;
};

export const price = async function price(contract) {
  return (await contract['price()']()) / 10 ** 18;
};

export const symbol = async function symbol(contract) {
  return contract['symbol()']();
};

export const totalSupply = async function totalSupply(contract) {
  return (await contract['totalSupply()']()) / 10 ** 18;
};

export const priceBuy = async function priceBuy(contract) {
  return (await contract['priceBuy()']()) / 10 ** 18;
};

export const equityPerToken = async function equityPerToken(contract) {
  return (await contract['equityPerToken()']()) / 10 ** 18;
};

export const reserveMultipleMin = async function reserveMultipleMin(contract) {
  return (await contract['RESERVE_MULTIPLE_MIN()']()) / 10 ** 18;
};

export const reserveRatio = async function reserveRatio(contract) {
  return (await contract['reserveRatio()']()) / 10 ** 18;
};

export const reserveBalance = async function reserveBalance(contract) {
  return (await contract['reserveBalance()']()) / 10 ** 18;
};

export const stableCoinAddress = function stableCoinAddress(contract) {
  return contract['daiPool()']();
};

/*
      # Write
*/
export const approve = async function approve(contract, spender, signer) {
  return sendTx(contract, signer, 'approve(address,uint256)', [spender, ethers.constants.MaxUint256]);
};

export const buy = async function buy(contract, signer, wad) {
  return sendTx(contract, signer, 'buy(uint256)', [wad]);
};

export const sell = async function sell(contract, signer, wad) {
  return sendTx(contract, signer, 'sell(uint256)', [wad]);
};

export const mayApprove = async function mayApprove(erc20, signerAddress, spender, signer) {
  if (await allowance(erc20, signerAddress, spender) !== ethers.constants.MaxUint256) {
    await approve(erc20, spender, signer);
  }
};
