pragma solidity 0.8.13;
import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/BMW.sol";
import "../src/BXAU.sol";

contract S is Script {
    function run()
        external
    {
         address addr = 0x48B94A6801812DD832617801194187325F523402;
         BMW bmw = BMW(addr);
	 console.log(bmw.name());
    }
}
