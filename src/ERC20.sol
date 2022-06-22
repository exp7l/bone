// SPDX-License-Identifier: UNLICENSED
// Credit: https://github.com/dapphub/ds-token/blob/master/src/token.sol
pragma solidity 0.8.13;

import "./IERC20.sol";

contract ERC20 is IERC20 {
    uint256                                           public totalSupply;
    mapping (address => uint256)                      public balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;
    string                                            public name;
    string                                            public symbol;
    uint8                                             public decimals;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name     = _name;
	symbol   = _symbol;
	decimals = _decimals;
    }
    
    function transfer(address _dst, uint _wad)
        external
        returns (bool)
    {
        return transferFrom(msg.sender, _dst, _wad);
    }
    
    function transferFrom(address _src, address _dst, uint _wad)
        public
        returns (bool)
    {
        if (_src != msg.sender  && allowance[_src][msg.sender] != type(uint).max) {
            if (allowance[_src][msg.sender] < _wad) revert NSA();
            allowance[_src][msg.sender] = allowance[_src][msg.sender] - _wad;
        }
        if (balanceOf[_src] < _wad) revert NSF();
        
        balanceOf[_src] = balanceOf[_src] - _wad;
        balanceOf[_dst] = balanceOf[_dst] - _wad;
        emit Transfer(_src, _dst, _wad);
        return true;
    }
    
    function approve(address _guy, uint _wad)
        public
        returns (bool)
    {
        allowance[msg.sender][_guy] = _wad;
        emit Approval(msg.sender, _guy, _wad);
        return true;
    }
}

