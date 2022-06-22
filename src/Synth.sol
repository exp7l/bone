// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "./BMW.sol";
import "./Math.sol";
import "./ERC20.sol";
import "./IERC20Synth.sol";
import "../lib/chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Synth is ERC20, IERC20Synth, Math {
    AggregatorV3Interface public           refusd;
    AggregatorV3Interface public           daiusd;
    BMW                   public           bmw;
    ERC20                 public           dai;
    uint                  public immutable fee;
    uint                  public immutable cratioFloor;

    event                 Mint(address indexed guy, uint wad);
    event                 Redemption(address indexed guy, uint wad);

    error REFUSD();
    error DAIUSD();
    error Cratio();

    constructor(
        BMW           _bmw,
	address       _refusd,
	address       _daiusd,
	address       _dai,
	uint          _fee,
	uint          _cratioFloor,
	string memory _name,
	string memory _symbol
    ) ERC20(_name, _symbol, 18)
    {
        bmw         = _bmw;
	refusd      = AggregatorV3Interface(_refusd);
	daiusd      = AggregatorV3Interface(_daiusd);
	dai         = ERC20(_dai);
	fee         = _fee;
	cratioFloor = _cratioFloor;
    }

    function mintPrice()
        virtual
        public
	view
	returns (uint)
    {
        (, int256 _iREFUSD, , , ) = refusd.latestRoundData();
	if (_iREFUSD <= 0)          revert REFUSD();
	uint _REFUSD              = uint(_iREFUSD) * 1e8;

        (, int256 _iDAIUSD, , , ) = daiusd.latestRoundData();
	if (_iDAIUSD <= 0)          revert DAIUSD();
	uint _DAIUSD              = uint(_iDAIUSD) * 1e8;
        return                      wmul(_REFUSD, wdiv(WAD, _DAIUSD));
    }

    function redemptionPrice()
        virtual
        public
	view
	returns (uint)
    {
        return mintPrice();
    }

    function liability()
        virtual
        public
	view
	returns (uint)
    {
        return wmul(totalSupply, redemptionPrice());
    }

    function mint(uint _wad)
        virtual
        public
	returns (bool)
    {
        if (bmw.cratio() < cratioFloor)   revert Cratio();
	uint total             = wmul(wmul(_wad, mintPrice()), WAD + fee);
	dai.transferFrom(msg.sender, address(bmw), total);
	balanceOf[msg.sender]  = balanceOf[msg.sender] + _wad;
        totalSupply            = totalSupply           + _wad;
        if (bmw.cratio() < cratioFloor)   revert Cratio();
	emit Mint(msg.sender, _wad);
	return true;
    }

    function redeem(uint _wad)
        virtual
        public
	returns (bool)
    {
        if (balanceOf[msg.sender] < _wad)  revert NSF();
	uint _liability  = liability();
        uint _price;
	if (_liability == 0 || totalSupply == 0) {
	     _price                           = redemptionPrice();
	} else {
	     uint _liabilityFraction          = wdiv(_liability, bmw.liability());
	     uint _reserveShare               = wmul(_liabilityFraction, bmw.reserve());
	     uint _reservePerToken            = wdiv(_reserveShare, totalSupply);
	     _price                           = min(_reservePerToken, redemptionPrice());
	}
        uint _total                       = wmul(wmul(_wad, _price), WAD - fee);
	dai.transferFrom(address(bmw), msg.sender, _total);
	balanceOf[msg.sender]            = balanceOf[msg.sender] - _wad;
        totalSupply                      = totalSupply           - _wad;
	emit Redemption(msg.sender, _wad);
	return true;
    }
}
