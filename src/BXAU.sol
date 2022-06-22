// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "./Synth.sol";
import "./BMW.sol";

contract BXAU is Synth {
    constructor(BMW _bmw, address _xauusd, address _daiusd, address _dai)
        Synth(_bmw, _xauusd, _daiusd, _dai, 0.01 * 1e18, 1.1 * 1e18, "Bone Gold", "BXAU")
    {}
}
