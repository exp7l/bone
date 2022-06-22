pragma solidity 0.8.13;
import "forge-std/Script.sol";
import "../src/BMW.sol";
import "../src/BXAU.sol";

contract S is Script {
    function run()
        external
    {
        // chainId: 1
	// address dai    = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
	// address xauusd = 0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6;
	// address daiusd = 0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9;

        // chainId: 4
	address dai       = 0x6A9865aDE2B6207dAAC49f8bCba9705dEB0B0e6D;
	address xauusd    = 0x81570059A0cb83888f1459Ec66Aad1Ac16730243;
	address daiusd    = 0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF;
        vm.startBroadcast();
	BMW  bmw       = new BMW(dai);
	BXAU bxau      = new BXAU(bmw, xauusd, daiusd, dai);
	vm.stopBroadcast();
        vm.broadcast();
    }
}
