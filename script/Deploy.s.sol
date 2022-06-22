pragma solidity 0.8.13;
import "forge-std/Script.sol";
import "../src/BMW.sol";
import "../src/BXAU.sol";

contract S is Script {
    function run()
        external
    {
        // chainId: 1
	address dai    = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
	address xauusd = 0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6;
	address daiusd = 0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9;
        vm.startBroadcast();
	BMW  bmw       = new BMW(dai);
	BXAU bxau      = new BXAU(bmw, xauusd, daiusd, dai);
	vm.stopBroadcast();
        vm.broadcast();
        bmw.pushSynth(address(bxau2));
    }
}
