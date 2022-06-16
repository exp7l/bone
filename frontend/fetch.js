import { objectify } from './utils.js';

const fetchJson = async function fetchJson(url) {
  return (await fetch(url)).json();
};

export default async function fetchInputs() {
  const [
    daiABI,
    stableABI,
    rightABI,
    pipsMainnet,
    rcLocal,
  ] = await Promise.all([
    fetchJson('out/dai-abi.json'),
    fetchJson('out/sc-abi.json'),
    fetchJson('out/rc-abi.json'),
    fetchJson('out/pips-mainnet.json'),
    fetchJson('out/rc-local.json'),
  ]);
  const daiAddress = pipsMainnet.DAI;
  const pipAddresses = objectify(rcLocal, (object) => object.PIP, (object) => object.ADDRESS);
  return {
    daiABI, stableABI, rightABI, daiAddress, pipAddresses,
  };
}
