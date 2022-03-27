export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000"
export const RED = 'danger'
export const GREEN = 'success'

export const DECIMALS = (10**18)

// Short cut to avoid passing around web3 connection
export const ethers = (wei) => {
	if(wei) {
		return(wei / DECIMALS) //18 decimals places
	}
}

// Tokens and Ether have the same decimal resolution
export const tokens = ethers