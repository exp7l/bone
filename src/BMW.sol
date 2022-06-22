// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "./Math.sol";
import "./ERC20.sol";
import "./IERC20Synth.sol";
import "forge-std/console.sol";

contract BMW is ERC20("Bone Marrow", "BMW", 18), Math {
    ERC20         public immutable dai;
    IERC20Synth[] public           synths;
    uint          public constant  priceFloor  = 1e18;
    uint          public constant  fee         = 0.003 * 1e18;
    uint          public           cratioFloor = 1.2 * 1e18;

    error Cratio();
    event         Mint(address indexed guy, uint wad);
    event         Redemption(address indexed guy, uint wad);

    constructor(address _dai)
    {
	dai     = ERC20(_dai);
    }

    function equityPerToken()
        public
	view
	returns (uint)
    {
    	return wdiv(equity(), totalSupply);
    }

    function equity()
        public
	view
	returns (uint)
    {
        return reserve() - liability();
    }

    function reserve()
        public
	view
	returns (uint)
    {
        return dai.balanceOf(address(this));
    }


    function liability()
        public
	view
	returns (uint)
    {
        uint sum = 0;
        for (uint i = 0; i < synths.length; i++)
	    sum = sum + synths[i].liability();
        return sum;
    }

    function cratio()
        public
	view
	returns (uint)
    {
        uint _liability = liability();
	uint _reserve   = reserve();
	if (_reserve == 0) return 0;
	if (_liability == 0) return type(uint).max;
        return wdiv(_reserve, _liability);
    }

    function mintPrice()
        public
	view
	returns (uint)
    {
        return totalSupply == 0 ? priceFloor : max(priceFloor, equityPerToken());
    }

    function redemptionPrice()
        public
	view
	returns (uint)
    {
        return totalSupply == 0 ? 0 : equityPerToken();
    }

    // TODO: auth
    function pushSynth(address _synth)
        public
	returns (bool)
    {
        console.log("start");
        synths.push(IERC20Synth(_synth));
	console.log("2");
	dai.approve(_synth, type(uint).max);
	console.log("3");
	return true;
    }

    function mint(uint _wad)
        public
	returns (bool)
    {
        console.log("mint start");
        uint total            = wmul(wmul(_wad, mintPrice()), WAD + fee);
	console.log(msg.sender);
	console.log(address(this));
	console.log(total);
	console.log(_wad);
	console.log(dai.balanceOf(msg.sender));
	bool status = dai.transferFrom(msg.sender, address(this), total);
	console.log(status);
	console.log("3");
	balanceOf[msg.sender] = balanceOf[msg.sender] + _wad;
	console.log("4");
        totalSupply           = totalSupply           + _wad;
	console.log("5");
	emit                    Mint(msg.sender, _wad);
	console.log("6");
	return                  true;
    }

    function redeem(uint _wad)
    	public
	returns (bool)
    {
        if (balanceOf[msg.sender] < _wad) revert NSF();
	if (cratio() < cratioFloor)       revert Cratio();
	uint total                        = wmul(wmul(_wad, redemptionPrice()), WAD - fee);
	balanceOf[msg.sender]             = balanceOf[msg.sender] - _wad;
        totalSupply                       = totalSupply           - _wad;
	dai.transfer(msg.sender, total);
	if (cratio() < cratioFloor)       revert Cratio();
	emit                              Redemption(msg.sender, _wad);
	return                            true;
    }
}
