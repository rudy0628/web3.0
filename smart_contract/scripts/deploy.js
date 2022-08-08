const main = async () => {
	// get the contract
	const Transactions = await hre.ethers.getContractFactory('Transactions');

	// deployed the contract
	const transactions = await Transactions.deploy();

	// ensure the contract is deployed
	await transactions.deployed();

	console.log('Transactions deployed to:', transactions.address);
};

const runMain = async () => {
	try {
		// execute main
		await main();
		process.exit(0);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

runMain();
