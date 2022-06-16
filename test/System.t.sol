// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../src/BMXAU.sol";
import "../src/BXAU.sol";
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
    BMXAU   bmxau;
    BXAU    bxau;
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
        bmxau    = new BMXAU(xauusd, daiusd, dai);
	bxau     = bmxau.bxau();
	
	vm.prank(rich);
	daiObj.transfer(test0, 20_000_000 * WAD);

        vm.startPrank(test0);
    }

    function testMintRC()
    	public
    {
        uint obal = daiObj.balanceOf(test0);
        daiObj.approve(address(bmxau), 110 * WAD);
	bmxau.mint(100 * WAD);
	assertEq(bmxau.balanceOf(test0), 100 * WAD);
	uint nbal = daiObj.balanceOf(test0);
	assertEq(nbal, obal - wmul(100 * WAD, WAD + bmxau.fee()));
	assertEq(bmxau.totalSupply(), 100 * WAD);
    }

    function testRedeemRC()
        public
    {
        testMintRC();
        uint obal = daiObj.balanceOf(test0);
	bmxau.redeem(100 * WAD);
	assertEq(bmxau.balanceOf(test0), 0);
	assertEq(daiObj.balanceOf(test0), obal + wmul(101 * WAD, WAD - bmxau.fee()));	
    }

    function testMintSC()
        public
    {
        testMintRC();
        uint obal = daiObj.balanceOf(test0);
	daiObj.approve(address(bxau), type(uint).max);
        bxau.mint(0.01 * 1e18);
	assertEq(bxau.balanceOf(test0), 0.01 * 1e18);
	assertEq(daiObj.balanceOf(test0), obal - wmul(bxau.price(), wmul(0.01 * 1e18, WAD + bxau.fee())));
    }

    function testCannotMintSCWhenNSF()
        public
    {
        testMintRC();
        daiObj.transfer(test0, daiObj.balanceOf(test0));
        vm.expectRevert(NSF.selector);
        bxau.mint(0.01 * 1e18);
    }

    function testCannotMintSCWhenEmptyReserve()
        public
    {
    	daiObj.approve(address(bxau), type(uint).max);
	vm.expectRevert(Cratio.selector);
        bxau.mint(1000 * 1e18);

      	daiObj.approve(address(bxau), 0);
	vm.expectRevert(Cratio.selector);
        bxau.mint(1000 * 1e18);
    }

    function testCannotMintSCWhenBreachingCRatio()
        public
    {
        testMintRC();
        uint obal = daiObj.balanceOf(test0);
	daiObj.approve(address(bxau), type(uint).max);
	vm.expectRevert(Cratio.selector);
        bxau.mint(1000 * 1e18);
    }

    function testRedeemSC()
    	public
    {
	testMintSC();
        uint obal = daiObj.balanceOf(test0);
	bxau.redeem(0.01 * 1e18);
        assertEq(bxau.balanceOf(test0), 0);
	assertEq(daiObj.balanceOf(test0), obal + wmul(bxau.price(), wmul(0.01 * 1e18, WAD - bxau.fee())));
    }
}
