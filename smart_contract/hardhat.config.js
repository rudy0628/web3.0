//https://eth-goerli.g.alchemy.com/v2/MZHq69tuLt4bScNS_QczESQuKFyWoWrP

require('@nomiclabs/hardhat-waffle');

module.exports = {
	solidity: '0.8.0',
	networks: {
		goerli: {
			url: 'https://eth-goerli.g.alchemy.com/v2/MZHq69tuLt4bScNS_QczESQuKFyWoWrP',
			accounts: [
				'a5558325a1505ee880a45301a4c2f84f4cf5079b6a624ac24de052a1494de2bc',
			],
		},
	},
};
