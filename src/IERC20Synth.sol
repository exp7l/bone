pragma solidity 0.8.13;

import "./IERC20.sol";

interface IERC20Synth is IERC20 {
    function mintPrice()       external view returns (uint256);
    function redemptionPrice() external view returns (uint256);
    function fee()             external view returns (uint256);
    function cratioFloor()     external view returns (uint256);
    function liability()       external view returns (uint256);
}
