// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

contract Math {
    uint constant WAD = 1e18;

    function min(uint x, uint y)
        internal
        pure
	returns (uint z)
    {
        z = x <= y ? x : y;
    }

    function max(uint x, uint y)
        internal
	pure
	returns (uint z)
    {
        return x >= y ? x : y;
    }

    //rounds to zero if x*y < WAD / 2
    function wmul(uint x, uint y)
        internal
        pure
	returns (uint z)
    {
        z = (x * y + WAD / 2) / WAD;
    }
    
    //rounds to zero if x/y < y / 2
    function wdiv(uint x, uint y)
        internal
        pure
	returns (uint z)
    {
        z = (x * WAD + y / 2) / y;
    }
}

// Credit: https://github.com/dapphub/ds-math/blob/master/src/math.sol