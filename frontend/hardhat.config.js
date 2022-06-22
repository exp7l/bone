require("@nomiclabs/hardhat-ethers")

const fs         = require("fs")
const daiABI     = fs.readFileSync("./configs/DAI.json", "utf8")
const curve      = "0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7"
const dai        = "0x6b175474e89094c44da98b954eedeac495271d0f"
const eoa        = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"

task("stealDai", "", async (_, hre) => {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [curve]
  })
  const signer   = await ethers.getSigner(curve)
  await network.provider.send("hardhat_setBalance", [curve, "0x10000000000000000000"])
  const daiObj   = new ethers.Contract(dai, daiABI, signer)
  const amt      = ethers.BigNumber.from("20000000000000000000000000")
  console.log(await daiObj.transfer(eoa, amt))
  await hre.network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [curve]
  })
})

module.exports   = {
  networks: {
    hardhat: {
      forking: {
        url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        blockNumber: 14662921
      }
    }
  }
}
