// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "./BXAU.sol";
import "./Math.sol";
import "./ERC20.sol";

contract BMXAU is ERC20("Bone Marrow Gold", "BMXAU", 18), Math {
    BXAU   public immutable bxau;
    ERC20  public immutable dai;
    uint   public constant  priceFloor = 1e18;
    uint   public constant  fee        = 0.01 * 1e18;

    error Cratio();
    
    constructor(address _xauusd, address _daiusd, address _dai) {
	bxau    = new BXAU(address(this), _xauusd, _daiusd, _dai);
	dai     = ERC20(_dai);
    }

    function equityPerRC()
        public
	view
	returns (uint)
    {
    	return totalSupply == 0 ? 0 : wdiv(bxau.daiBalance() - bxau.liabilities(), totalSupply);
    }

    function mint(uint _wad)
        public
	returns (bool)
    {
        uint price            = max(priceFloor, equityPerRC());
	uint preFee           = wmul(_wad, price);
        uint total            = wmul(preFee, WAD + fee);
	uint allowance        = dai.allowance(msg.sender, address(this));
	if (allowance < total)  revert NSF();
	dai.transferFrom(msg.sender, address(bxau), total);
	balanceOf[msg.sender] = balanceOf[msg.sender] + _wad;
        totalSupply           = totalSupply           + _wad;
	emit                    Mint(_wad, msg.sender);
	return                  true;
    }

    function redeem(uint _wad)
    	public
	returns (bool)
    {
        if (balanceOf[msg.sender] < _wad) revert NSF();
	if (bxau.breachedCratio())        revert Cratio();
	uint preFee                       = wmul(_wad, equityPerRC());
	uint total                        = wmul(preFee, WAD - fee);
	balanceOf[msg.sender]             = balanceOf[msg.sender] - _wad;
        totalSupply                       = totalSupply           - _wad;	
	dai.transferFrom(address(bxau), msg.sender, total);
	if (bxau.breachedCratio())        revert Cratio();
	emit                              Redemption(_wad, msg.sender);
	return                            true;
    }
}
