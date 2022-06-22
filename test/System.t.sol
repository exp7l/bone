// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../src/BMW.sol";
import "../src/Synth.sol";
import "../src/Math.sol";
import "forge-std/Test.sol";
import "forge-std/console.sol";

contract ContractTest is Test, Math {
    address test0; 
    address rich;  
    address dai; 
    ERC20   daiObj;
    address xauusd;
    address daiusd;
    BMW     bmw;
    error   Cratio();
    error   NSF();
    
    function setUp() public {
	test0  = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;    
        rich   = 0xaD0135AF20fa82E106607257143d0060A7eB5cBf;
	dai    = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
	daiObj = ERC20(dai);	
	xauusd = 0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6;
	daiusd = 0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9;
	
        vm.prank(test0);
        bmw    = new BMW(dai);
	
	vm.prank(rich);
	daiObj.transfer(test0, 20_000_000 * WAD);

        vm.startPrank(test0);
    }

    function testMintBMW()
	public
    {
        uint oldBalance = daiObj.balanceOf(test0);
        daiObj.approve(address(bmw), 200 * WAD);
	bmw.mint(100 * WAD);
	assertEq(bmw.balanceOf(test0), 100 * WAD);
	assertEq(daiObj.balanceOf(test0), oldBalance - wmul(100 * WAD, WAD + bmw.fee()));
    }

    function testRedeemBMW()
        public
    {
        testMintBMW();
        uint oldBalance = daiObj.balanceOf(test0);
	uint preFee     = wmul(40 * WAD, bmw.redemptionPrice());
	uint expected   = wmul(preFee, WAD - bmw.fee());
	bmw.redeem(40 * WAD);
	assertEq(bmw.balanceOf(test0), 60 * WAD);
	uint diff = daiObj.balanceOf(test0) - oldBalance;
	assertEq(diff, expected);
    }

    function testMintXAU()
        public
	returns (Synth)
    {
        testMintBMW();
	Synth bxau      = new Synth(
            bmw, xauusd, daiusd, dai, 0.01 * 1e18, 1.1 * 1e18, "Bone Gold", "BXAU"
	);
	bmw.pushSynth(address(bxau));
	daiObj.approve(address(bxau), type(uint).max);
        uint oldBalance = daiObj.balanceOf(test0);
        bxau.mint(0.01 * 1e18);
	assertEq(bxau.balanceOf(test0), 0.01 * 1e18);
	uint diff       = oldBalance - daiObj.balanceOf(test0);
	uint expected   = wmul(bxau.mintPrice(), wmul(0.01 * 1e18, WAD + bxau.fee()));
	assertEq(diff, expected);
	return bxau;
    }

    function testRedeemXAU()
	public
    {
        Synth bxau      = testMintXAU();
        uint oldBalance = daiObj.balanceOf(test0);
	bxau.redeem(0.01 * 1e18);
	assertEq(bxau.balanceOf(test0), 0);
	uint diff       = daiObj.balanceOf(test0) - oldBalance;
	uint expected   = wmul(bxau.redemptionPrice(), wmul(0.01 * 1e18, WAD - bxau.fee()));
	assertEq(diff, expected);
    }

    function testCannotMintXAUNSF()
        public
    {
        testMintBMW();
	Synth bxau = new Synth(
            bmw, xauusd, daiusd, dai, 0.01 * 1e18, 110 * 1e18, "Bone Gold", "BXAU"
	);
        vm.expectRevert(bytes("Dai/insufficient-allowance"));
        bxau.mint(0.01 * 1e18);
    }

    function testCannotMintEmptyReserve()
        public
    {
    	Synth bxau = new Synth(
            bmw, xauusd, daiusd, dai, 0.01 * 1e18, 110 * 1e18, "Bone Gold", "BXAU"
	);
	daiObj.approve(address(bxau), type(uint).max);
	vm.expectRevert(Cratio.selector);
        bxau.mint(1000 * 1e18);
      	daiObj.approve(address(bxau), 0);
	vm.expectRevert(Cratio.selector);
        bxau.mint(1000 * 1e18);
    }

    function testCannotMintWhenBreachingCRatio()
        public
    {
        Synth bxau = testMintXAU();
	vm.expectRevert(Cratio.selector);
        bxau.mint(1000 * 1e18);
    }
}
