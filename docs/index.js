const { ethers } = globalThis
const provider   = new ethers.providers.Web3Provider(globalThis.ethereum, 'any')
const d          = document

async function getConf() {
  const responses = await Promise.all(
    [
      fetch('DAI.json'),
      fetch('BMW.json'),
      fetch('BXAU.json'),
      fetch('address-book-4.json')
      // fetch('address-book-1337.json')
    ]
  )
  const [
    daiABI,
    bmwABI,
    bxauABI,
    addressBook
  ] = await Promise.all(responses.map(resp => resp.json()))
  return { daiABI, bmwABI, bxauABI, addressBook }
}

async function getConn() {
  const network       = await provider.getNetwork()
  if (![ 31337, 4, 1 ].includes(network.chainId)) throw new Error('Network not supported.')
  const signer        = provider.getSigner()
  const signerAddress = await signer.getAddress(0)
  return { signer, signerAddress, network, }
}

function contracts({
  daiABI,
  bmwABI,
  bxauABI,
  signer,
  addressBook: {DAI, BMW, BXAU}
}) {
  return {
    "DAI":  new ethers.Contract(DAI,  daiABI,  signer),
    "BMW":  new ethers.Contract(BMW,  bmwABI,  signer),
    "BXAU": new ethers.Contract(BXAU, bxauABI, signer)
  }
}

async function assetData(contract, dai, signerAddress) {
  const [
    balance,
    totalSupply,
    mintPrice,
    redemptionPrice,
    liability,
    cratioFloor,
    allowance,
    fee
  ] = (await Promise.all([
    contract.balanceOf(signerAddress),
    contract.totalSupply(),
    contract.mintPrice(),
    contract.redemptionPrice(),
    contract.liability(),
    contract.cratioFloor(),
    dai.allowance(signerAddress, contract.address),
    contract.fee()
  ])).map(x => ethers.utils.formatUnits(x))
  return {
    "Your Balance                 ": balance,
    "Total Supply                 ": totalSupply,
    "Mint Price              (DAI)": mintPrice,
    "Redemption Price        (DAI)": redemptionPrice,
    "Liability               (DAI)": liability,
    "Mint C-Ratio Floor (multiple)": cratioFloor,
    "DAI Approved            (DAI)": allowance,
    "Fee                       (%)": fee,
    "address                      ": contract.address
  }
}

async function reserveData(contract, signerAddress, daiContract) {
  const [
    balance,
    mintPrice,
    redemptionPrice,
    cratioFloor,
    cratio,
    reserve,
    liability,
    equity,
    totalSupply,
    allowance,
    fee
  ] = await Promise.all([
    contract.balanceOf(signerAddress),
    contract.mintPrice(),
    contract.redemptionPrice(),
    contract.cratioFloor(),
    contract.cratio(),
    contract.reserve(),
    contract.liability(),
    contract.equity(),
    contract.totalSupply(),
    daiContract.allowance(signerAddress, contract.address),    
    contract.fee(),
  ])
  return {
    "Your Balance                       ": ethers.utils.formatUnits(balance),
    "Mint Price                    (DAI)": ethers.utils.formatUnits(mintPrice),
    "Redemption Price              (DAI)": ethers.utils.formatUnits(redemptionPrice),
    "Redemption C-Ratio floor (multiple)": ethers.utils.formatUnits(cratioFloor),
    "Global C-Ratio           (multiple)": ethers.utils.formatUnits(cratio),    
    "Global Reserve                (DAI)": ethers.utils.formatUnits(reserve),
    "Global Liablity               (DAI)": ethers.utils.formatUnits(liability),
    "Global Equity                 (DAI)": ethers.utils.formatUnits(equity),
    "Global Retailed Earning       (DAI)": ethers.utils.formatUnits(equity.sub(totalSupply)),
    "Fee                             (%)": ethers.utils.formatUnits(fee),
    "BMW Supply                         ": ethers.utils.formatUnits(totalSupply),
    "address                            ": contract.address,
    "DAI Approved                  (DAI)": ethers.utils.formatUnits(allowance),
    // FIXME: make sure asset is deployed.
    "Approved Assets                    ": [ await contract.synths(0) ],    
  }
}

globalThis.onload = async function onLoad() {
  if (!( typeof globalThis !== 'undefined' )) {
    throw new Error("Browser doesn't support ES2020.")
  }
  
  await provider.send('eth_requestAccounts', [])
  
  let state = {provider}
  state = Object.assign(state, await getConn())
  state = Object.assign(state, await getConf())
  state = Object.assign(state, contracts(state))
  
  d.querySelector("pre#conn").textContent = JSON.stringify({
    ...state.network,
    ...state.provider.connection,
    pollingInterval: state.provider._pollingInterval,
    signerAddress:   state.signerAddress,
    daiBalace:       ethers.utils.formatUnits(await state.DAI.balanceOf(state.signerAddress))
  }, null, '\t')
  
  const renderAsset = async () => d.querySelector("pre#asset").textContent = JSON.stringify(
    await assetData(
      state[d.querySelector("select#picker").value],
      state.DAI,
      state.signerAddress
    ), null, '\t')
  
  await renderAsset()
  
  d.querySelector("select#picker").onchange = async () => await renderAsset()

  d.querySelector("pre#reserve").textContent = JSON.stringify(await reserveData(state.BMW, state.signerAddress, state.DAI), null, '\t')

  d.querySelector("button#mint").onclick = async () => {
    const asset    = d.querySelector("select#picker").value    
    const quantity = d.querySelector("input#quantity").value
    const wad      = ethers.utils.parseUnits(quantity)
    const response  = await state[asset].mint(wad)
    console.log(await response.wait())
  }

  d.querySelector("button#redeem").onclick = async () => {
    const asset    = d.querySelector("select#picker").value
    const quantity = d.querySelector("input#quantity").value
    const wad      = ethers.utils.parseUnits(quantity)
    const response  = await state[asset].redeem(wad)
    console.log(await response.wait())    
  }

   d.querySelector("button#approve").onclick = async () => {
    const asset    = d.querySelector("select#picker").value
    const quantity = d.querySelector("input#quantity").value
    const wad      = ethers.utils.parseUnits(quantity)
    const response = await state.DAI.approve(state.addressBook[asset], wad)
    console.log(await response.wait())
  }

  d.querySelector("button#r-mint").onclick = async () => {
    const quantity = d.querySelector("input#r-quantity").value
    const wad      = ethers.utils.parseUnits(quantity)
    const response  = await state.BMW.mint(wad)
    console.log(await response.wait())
  }

  d.querySelector("button#r-redeem").onclick = async () => {
    const quantity = d.querySelector("input#r-quantity").value
    const wad      = ethers.utils.parseUnits(quantity)
    const response  = await state.BMW.redeem(wad)
    console.log(await response.wait())
  }

  d.querySelector("button#r-approve").onclick = async () => {
    const quantity = d.querySelector("input#r-quantity").value
    const wad      = ethers.utils.parseUnits(quantity)
    const response = await state.DAI.approve(state.addressBook['BMW'], wad)
    console.log(await response.wait())
  }

  d.querySelector("button#push").onclick = async () => {
    const address  = d.querySelector("input#addr").value
    const response = await state.BMW.pushSynth(address)
    console.log(await response.wait())
  }
}
