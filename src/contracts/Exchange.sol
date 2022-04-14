pragma solidity ^0.5.0;

// import Token smart contract
import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Exchange {
	using SafeMath for uint;

	address public feeAccount;  //The account that receives exchange fees
	uint256 public feePercentage;
	uint256 public orderCount;  // Initialy is set to 0, each time an order is created it will be incremented by 1 - The value of orderCount is the total number of Orders
	uint256 public withdrawCount; // Initialy is set to 0, each time a withdraw is done it will be incremented by 1 - The value of withdrawCount is the total number of Withdraws

	address constant ETHER = address(0); // store Ether in tokens mapping using the blank address to differentiate from the token's address

	// Mappings

	// tokens mapping is initially set to 0 - Balances
	mapping(address => mapping(address => uint256)) public tokens; // mapping tokens will map the Token's address onto the user address to get the total tokens owned by the user

	// A way to store an Order
	mapping(uint256 => _Order) public orders;

	// A way to cancel an Order
	mapping(uint256 => bool) public orderCancelled;

	// A way to keep track of the orders that have been already filled
	mapping(uint256 => bool) public orderFilled;

	// Events
	event Deposit(address token, address user, uint256 amount, uint256 balance, uint256 timestamp);
	event Withdraw(uint256 withdrawId, address token, address user, uint256 amount, uint256 balance, uint256 timestamp);
	event Order(uint256 orderId, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
	event Cancel(uint256 orderId, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
	event Trade(uint256 orderId, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address userFill, uint256 timestamp);


	// Structs

	// A structure of an Order
	struct _Order {
		uint256 orderId;
		address user;
		address tokenGet;
		uint256 amountGet;
		address tokenGive;
		uint256 amountGive;
		uint256 timestamp;
	}

	constructor(address _feeAccount, uint256 _feePercentage) public {
		feeAccount = _feeAccount;
		feePercentage = _feePercentage;

	}

	// Fallback: revers if Ethers is sent to this Smart Contract by mistake
	function() external {
	    revert();
	}

	// depositEther function does not receive any parameter, the amount to be depositted is passed as an argumend - msg.value
	// In order to a function to accept Ether from the metadata it has to be considered a payable function
	function depositEther() payable public {

		// Manage deposit - Update the balance - Ether balance in the exchange is represented by the tokens mapping using the ETHER address -> address(0)
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);

		// Emit a Deposit event
		emit Deposit(ETHER,msg.sender,msg.value,tokens[ETHER][msg.sender],now);

	}

	// The caller of withdrawEther() function will always be an user
	//_amount is expressed in weis, most of the times before invoking this function you'll need to use the web3.utils.toWei(amount,'ether') function to convert the amount you want to deposit to weis
	function withdrawEther(uint256 _amount) public {
		withdrawCount = withdrawCount.add(1);
		require(tokens[ETHER][msg.sender] >= _amount);
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
		// Send ETHER from the Smart Contract address to the User address .... msg.sender refers to the user's address
		msg.sender.transfer(_amount);
		emit Withdraw(withdrawCount,ETHER,msg.sender,_amount,tokens[ETHER][msg.sender],now);
	}

	// The caller of depositToken() will be the user who is trying to deposit a token into the exchange
	function depositToken(address _token, uint256 _amount) public {

		// Rejects all attempts to deposit Ether using this function
		require(_token != ETHER);

		// Initialize an instance of the Token Smart Contract to call the transferFrom() function
		require(Token(_token).transferFrom(msg.sender,address(this),_amount));
			// The user's address can be accessed through the msg.sender variable - The address that calls this function will be the one where the tokens will be taken from
			// address(this) will be the address where the tokens will be deposited - The address of this Smart Contract
				// * If the transferFrom() function completes successfully means that the tokens were succesfully deposited into the Exchange address

		// Manage deposit - Update the balance - tokens balance in the exchange is represented by the tokens mapping
		tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);

		// Emit a Deposit event....
		emit Deposit(_token,msg.sender,_amount,tokens[_token][msg.sender],now);
	}

	// The caller of withdrawToken() will be the user who want to withdraw tokens from the exchange to its address
	function withdrawToken(address _token, uint256 _amount) public {
		withdrawCount = withdrawCount.add(1);
		require(_token != ETHER);
		require(tokens[_token][msg.sender] >= _amount);
		// Update the token exchange balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
		require(Token(_token).transfer(msg.sender,_amount));
		emit Withdraw(withdrawCount,_token,msg.sender,_amount,tokens[_token][msg.sender],now);
	}

	function balanceOf(address _token, address _user) public view returns (uint256) {
		return tokens[_token][_user];
	}

	// makeOrder() function is called by an user who wants to swap tokens
	function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
		orderCount = orderCount.add(1);
		// Adding the order to the orders mapping; the mapping requires an _Order object
		orders[orderCount] = _Order(orderCount,msg.sender,_tokenGet, _amountGet, _tokenGive, _amountGive, now);
		emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);

	}

	// cancelOrder() must be called from the order's owner and the order must exists
	function cancelOrder(uint256 _orderId) public {
		// Fetch the data of the Order that will be cancelled
		_Order storage _order = orders[_orderId];
		require(address(_order.user) == msg.sender);
		require(_order.orderId == _orderId);   // Validate the order exists
		orderCancelled[_orderId] = true;
		emit Cancel(_order.orderId,msg.sender,_order.tokenGet,_order.amountGet,_order.tokenGive,_order.amountGive, now);
	}

	// fillOrder() function is called by the user who is willing to fill the order and trade its tokens.
	function fillOrder(uint256 _orderId) public {
		require(_orderId > 0 && _orderId <= orderCount);
		require(!orderCancelled[_orderId]);
		require(!orderFilled[_orderId]);

		_Order storage _order = orders[_orderId];
		_trade(_order.orderId, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
		orderFilled[_order.orderId] = true;
	}

	// _trade() internal function will be called only by the same user who called the fillOrder() function,  _trade() is not accessible outside the Smart Contract
	function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
		// The userFill is the msg.sender - The one who called the fillOrder()....

		// Calculate the fees to charge - Fees are payed by the user who fills the order and are paid on tokens that the order is asking for...(tokenGet)
		uint256 _feeAmount = _amountGet.mul(feePercentage).div(100);

		// Take from the balance of the user who fills the order the tokens that the order is asking for && also charge the fees to the userFill
		tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount));
		// Add to the balance of the order's owner address the requested amount of tokens 
		tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);

		// Send the _feeAmount to the feeAccount - Update the balance of the feeAccount for the tokenGet address
		tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);

		// Take from the order's owner balance the tokens they offered to give in exchange for the tokens they wanted
		tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
		// Add to the userFill's balance the amount of tokens that the order's owner offered in exchange for the token they requested     
		tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive);

		emit Trade(_orderId,_user,_tokenGet,_amountGet,_tokenGive,_amountGive,msg.sender,now);
	}

}