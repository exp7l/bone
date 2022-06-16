// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "./Math.sol";
import "./BMXAU.sol";
import "./ERC20.sol";
import "../lib/chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract BXAU is ERC20("Bone Gold", "BXAU", 18), Math {
    AggregatorV3Interface public           xauusd;
    AggregatorV3Interface public           daiusd;
    ERC20                 public           dai;
    address               public           owner;
    uint                  public constant  fee          = 0.01 * 1e18;
    uint                  public constant  cratioFloor  = 1.1  * 1e18;
    
    error XAUUSD();
    error DAIUSD();
    error Cratio();
    
    constructor(address _owner, address _xauusd, address _daiusd, address _dai) {
	xauusd     = AggregatorV3Interface(_xauusd);
	daiusd     = AggregatorV3Interface(_daiusd);
	dai        = ERC20(_dai);
	dai.approve(_owner, type(uint).max);
	owner      = _owner;
    }

    function price()
        public
	view
	returns (uint)
    {
        (, int256 _iXAUUSD, , , ) = xauusd.latestRoundData();
	if (_iXAUUSD <= 0)          revert XAUUSD();
	uint _XAUUSD              = uint(_iXAUUSD) * 1e8;
	
        (, int256 _iDAIUSD, , , ) = daiusd.latestRoundData();
	if (_iDAIUSD <= 0)          revert DAIUSD();
	uint _DAIUSD              = uint(_iDAIUSD) * 1e8;

        uint _XAUDAI              = wmul(_XAUUSD, wdiv(WAD, _DAIUSD));
	if (totalSupply == 0)       return _XAUDAI;
	uint _reservePerSC        = wdiv(daiBalance(), totalSupply);
        return                      min(_XAUDAI, _reservePerSC);
    }

    function liabilities()
        public
	view
	returns (uint)
    {
        return wmul(totalSupply, price());   
    }

    function breachedCratio()
        public
	view
	returns (bool)
    {
	uint b             =  daiBalance();
        return b == 0 ? true : b <  wmul(cratioFloor, liabilities());
    }

    function daiBalance()
    	public
	view
	returns (uint)
    {
        return dai.balanceOf(address(this));
    }
    
    function mint(uint _wad)
        public
	returns (bool)
    {
        if (breachedCratio())   revert Cratio();
	uint preFee           = wmul(_wad, price());
	uint total            = wmul(preFee, WAD + fee);
	uint allowance        = dai.allowance(msg.sender, address(this));
	if (allowance < total)  revert NSF();
	dai.transferFrom(msg.sender, address(this), total);
	balanceOf[msg.sender] = balanceOf[msg.sender] + _wad;
        totalSupply           = totalSupply           + _wad;
	if (breachedCratio())   revert Cratio();
	emit Mint(_wad, msg.sender);
	return true;
    }
    
    function redeem(uint _wad)
        public
	returns (bool)
    {
        if (balanceOf[msg.sender] < _wad)  revert NSF();
	uint preFee                      = wmul(_wad, price());
	uint total                       = wmul(preFee, WAD - fee);
	dai.transfer(msg.sender, total);
	balanceOf[msg.sender]            = balanceOf[msg.sender] - _wad;
        totalSupply                      = totalSupply           - _wad;
	emit Redemption(_wad, msg.sender);
	return true;
    }
}
