export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

export const EVM_ERROR_REVERT = 'VM Exception while processing transaction: revert';

export const EVM_ERROR_INVALID_ADDRESS = 'invalid address';

export const ethers = (n) => {
	return new web3.utils.BN(
		web3.utils.toWei(n.toString(), 'ether')
	);
}

// Same logic as ethers - Converting a number to 18 decimals (wei)
export const tokens = (n) => ethers(n);