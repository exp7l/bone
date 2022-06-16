import "forge-std/Script.sol";
import "../src/BMXAU.sol";
import "../src/BXAU.sol";

contract MyScript is Script {
    function run()
        external
    {
        // Rinkeby
       	address dai    = 0x6A9865aDE2B6207dAAC49f8bCba9705dEB0B0e6D;
	address xauusd = 0x81570059A0cb83888f1459Ec66Aad1Ac16730243;
	address daiusd = 0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF;
        vm.startBroadcast();
	BMXAU bmxau    = new BMXAU(xauusd, daiusd, _dai);
    }
}