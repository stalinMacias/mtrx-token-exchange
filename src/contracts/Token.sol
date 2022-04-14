pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Token {

	using SafeMath for uint;

	string public name = "Maitrix Reloaded";
	string public symbol = "MTRX";
	uint256 public decimals = 18;
	uint256 public totalSupply;  // totalSupply must be initialized only in the constructor()

	mapping (address => uint256) public balanceOf;  // balanceOf will mapp a given address to the total amount of tokens it holds; The value of this variable can be accessed from anyone outside of the Smart Contract
	mapping (address => mapping(address => uint256)) public allowance; //allowance will map the amount of tokens that the spender is still allowed to spend from the owner


	//Events
	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed owner, address indexed spender, uint256 value);

	constructor() public {
		totalSupply = 1000000 * (10 ** decimals);
		// Initializing all the tokens into the Smart Contract's owner
		balanceOf[msg.sender] = totalSupply;
		
	}
	
	// This function is used when the owner wants to transfer funds to an address
	function transfer(address _to, uint256 _value) public returns (bool success) {
		require(balanceOf[msg.sender] >= _value);
		_transfer(msg.sender,_to,_value);   // msg.sender refers to the owner's address
		return true;
	}	

	/*	 msg.sender can be:
			* Refers to the token's owner if the functions is called from the transfer() public
			* Refers to the token's spender if the function is called from the transferFrom()

		* Because of the above statements, in the _transfer() internal function, msg.sender can not be used as default, instead _from is used

	*/
	function _transfer(address _from, address _to, uint256 _value) internal {
		require(_to != address(0));
		balanceOf[_from] = balanceOf[_from].sub(_value);
		balanceOf[_to] = balanceOf[_to].add(_value);
		emit Transfer(_from,_to,_value);
	}

	// Whoever calls the approve() function refers to the token's owner - msg.sender is the token's owner
	// Spender should be the Exchange smart contract
	// This function tells to the Exchange how much tokens will be allowed to spend from the owner's balance
	function approve(address _spender, uint256 _value) public returns(bool success) {
		require(_spender != address(0));
		allowance[msg.sender][_spender] = _value;   //Setting how much tokens will be allowed the spender to withdraw from the owner (Whoever calls this function refers to the token's owner)
		emit Approval(msg.sender,_spender,_value);
		return true;
	}

	// This function is called from the spender whenever they will transfer tokens on behalf of the token's owner - msg.sender refers to the spender, which is the Exchange Smart Contract
	// This function is used to make deposits
	// _from is the ower
	// _to is the receiver
	// msg.sender is whoever calls this function, for this case will be the Exchange Smart Contract
	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
		require(_value <= balanceOf[_from]);	// Validate that the token's owner has enough balance to complete the transference
		require(_value <= allowance[_from][msg.sender]);  //msg.sender refers to the spender - Validates that the spender is allowed to spend that much tokens 

		// Reduce the total spender's allowance, msg.sender refers to the spender address
		allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
		_transfer(_from,_to,_value);
		return true;
	}

	// function allowance(address _owner, address _spender) public view returns (uint256 remaining) - This function is created automatically by Solidity because the allowance mapping is declared as public



}