const { ethers } = globalThis
const provider   = new ethers.providers.Web3Provider(globalThis.ethereum, 'any')
const d          = document

async function getConf() {
  const responses = await Promise.all(
    [
      fetch('DAI.json'),
      fetch('BMW.json'),
      fetch('BXAU.json'),
      fetch('address-book-1337.json')
    ]
  )
  const [
    daiABI,
    bmwABI,
    bxauABI,
    addressBook
  ] = await Promise.all(
    responses.map(resp => resp.json())
  )
  return { daiABI, bmwABI, bxauABI, addressBook }
}

async function getConn() {
  const network       = await provider.getNetwork()
  if (![ 31337, 4, 1 ].includes(network.chainId)) throw new Error('Network not supported.')
  const signer        = provider.getSigner()
  const signerAddress = await signer.getAddress(0)
  return { signer, signerAddress, network, }
}

function readable(bn) {
  const quotient  = bn.div(ethers.constants.WeiPerEther).toString()
  const remainder = bn.mod(ethers.constants.WeiPerEther).toString()
  return `${quotient}.${remainder}`
}

function writeable(real) {
  return ethers.BigNumber.from(real).mul(ethers.constants.WeiPerEther)  ;
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
  return {
    "Your Balance                 ": readable(await contract.balanceOf(signerAddress)),
    "Total Supply                 ": readable(await contract.totalSupply()),
    "Mint Price              (DAI)": readable(await contract.mintPrice()),
    "Redemption Price        (DAI)": readable(await contract.redemptionPrice()),
    "Liability               (DAI)": readable(await contract.liability()),
    "Mint C-Ratio Floor (multiple)": readable(await contract.cratioFloor()),
    "DAI Approved            (DAI)": readable(await dai.allowance(signerAddress, contract.address)),
    "Fee                       (%)": readable(await contract.fee()),
    "address                      ": contract.address
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
    daiBalace:       readable(await state.DAI.balanceOf(state.signerAddress))
  }, null, '\t')
  
  const renderAsset = async () => d.querySelector("pre#asset").textContent = JSON.stringify(
    await assetData(
      state[d.querySelector("select#picker").value],
      state.DAI,
      state.signerAddress
    ), null, '\t')
  
  await renderAsset()
  console.log(state)
  d.querySelector("pre#reserve").textContent = JSON.stringify({
    "Your Balance                       ": readable(await state.BMW.balanceOf(state.signerAddress)),
    "Mint Price                    (DAI)": readable(await state.BMW.mintPrice()),
    "Redemption Price              (DAI)": readable(await state.BMW.redemptionPrice()),
    "Redemption C-Ratio floor (multiple)": readable(await state.BMW.cratioFloor()),
    "Global C-Ratio           (multiple)": readable(await state.BMW.cratio()),    
    "Global Reserve                (DAI)": readable(await state.BMW.reserve()),
    "Global Liablity               (DAI)": readable(await state.BMW.liability()),
    "Global Equity                 (DAI)": readable(await state.BMW.equity()),
    "Global Retailed Earning       (DAI)": readable((await state.BMW.equity()).sub(await state.BMW.totalSupply())),
    "Fee                             (%)": readable(await state.BMW.fee()),
    "BMW Supply                         ": readable(await state.BMW.totalSupply()),
    "address                            ": state.BMW.address,
    // FIXME: make sure asset is deployed.
    "Approved Assets                    ": [ await state.BMW.synths(0) ],    
  }, null, '\t')

  d.querySelector("select#picker").onchange = async () => await renderAsset()

  d.querySelector("button#mint").onclick = async () => {
    const asset    = d.querySelector("select#picker").value    
    const quantity = d.querySelector("input#quantity").value
    const wad      = writeable(quantity)
    const response  = await state[asset].mint(wad)
    console.log(await response.wait())
  }

  d.querySelector("button#redeem").onclick = async () => {
    const asset    = d.querySelector("select#picker").value
    const quantity = d.querySelector("input#quantity").value
    const wad      = writeable(quantity)
    const response  = await state[asset].redeem(wad)
    console.log(await response.wait())    
  }

  d.querySelector("button#approve").onclick = async () => {
    const asset    = d.querySelector("select#picker").value
    const quantity = d.querySelector("input#quantity").value
    const wad      = writeable(quantity)
    const response = await state.DAI.approve(state.addressBook[asset], wad)
    console.log(await response.wait())
  }

  d.querySelector("button#r-mint").onclick = async () => {
    const quantity = d.querySelector("input#r-quantity").value
    const wad      = writeable(quantity)
    const response  = await state.BMW.mint(wad)
    console.log(await response.wait())
  }

  d.querySelector("button#r-redeem").onclick = async () => {
    const quantity = d.querySelector("input#r-quantity").value
    const wad      = writeable(quantity)
    const response  = await state.BMW.redeem(wad)
    console.log(await response.wait())
  }

  d.querySelector("button#r-approve").onclick = async () => {
    const quantity = d.querySelector("input#r-quantity").value
    const wad      = writeable(quantity)
    const response = await state.DAI.approve(state.addressBook['BMW'], wad)
    console.log(await response.wait())
  }

  d.querySelector("button#push").onclick = async () => {
    const address  = d.querySelector("input#addr").value
    const response = await state.BMW.pushSynth(address)
    console.log(await response.wait())
  }
}
