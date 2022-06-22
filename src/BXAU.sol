// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "./Synth.sol";
import "./BMW.sol";

contract BXAU is Synth {
    constructor(BMW _bmw, address _xauusd, address _daiusd, address _dai)
        // TODO: the floor must be enforced to have higher floor than redemption cratio floor in reserve.
        Synth(_bmw, _xauusd, _daiusd, _dai, 0.01 * 1e18, 2 * 1e18, "Bone Gold", "BXAU")
    {}
}
