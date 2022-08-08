import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
	// Create a provide for ethereum
	const provider = new ethers.providers.Web3Provider(ethereum);
	// Get signer from provider
	const signer = provider.getSigner();

	// Use ethers object create contract
	const transactionContract = new ethers.Contract(
		contractAddress,
		contractABI,
		signer
	);

	return transactionContract;
};

export const TransactionProvider = ({ children }) => {
	const [currentAccount, setCurrentAccount] = useState('');
	const [formData, setFormData] = useState({
		addressTo: '',
		amount: '',
		keyword: '',
		message: '',
	});
	const [isLoading, setIsLoading] = useState(false);
	const [transactionCount, setTransactionCount] = useState(
		localStorage.getItem('transactionCount')
	);
	const [transactions, setTransactions] = useState([]);

	// onChange the form data
	const handleChange = (e, name) => {
		setFormData(prevState => ({ ...prevState, [name]: e.target.value }));
	};

	const getAllTransactions = async () => {
		try {
			if (!ethereum) return alert('Please install metamask');

			// Get the contract
			const transactionContract = getEthereumContract();

			// Use contract method getAllTransactions
			const availableTransactions =
				await transactionContract.getAllTransactions();

			// Clean the structure from availableTransactions
			const structuredTransactions = availableTransactions.map(transaction => ({
				addressTo: transaction.receiver,
				addressFrom: transaction.sender,
				timeStamp: new Date(+transaction.timestamp * 1000).toLocaleString(),
				message: transaction.message,
				keyword: transaction.keyword,
				amount: +transaction.amount._hex / 10 ** 18,
			}));

			setTransactions(structuredTransactions);
		} catch (error) {
			console.log(error);
			throw new Error('No ethereum object!');
		}
	};

	// Check if the wallet is connect when user visit the site
	const checkIfWalletIsConnected = async () => {
		try {
			// If no ethereum object, need to install metamask
			if (!ethereum) return alert('Please install metamask');

			// Get all accounts from metamask
			const accounts = await ethereum.request({ method: 'eth_accounts' });

			// if account is exist, set account[0] to currentAccount
			if (accounts.length) {
				setCurrentAccount(accounts[0]);

				// Get all transactions when account is existed.
				getAllTransactions();
			} else {
				console.log('No accounts found!');
			}
		} catch (error) {
			console.log(error);
			throw new Error('No ethereum object!');
		}
	};

	const checkIfTransactionsExist = async () => {
		try {
			// Get Contract
			const transactionContract = getEthereumContract();

			// Use contract method getTransactionCount
			const transactionCount = await transactionContract.getTransactionCount();

			// Set transactionCount to local storage
			window.localStorage.setItem('transactionCount', transactionCount);
		} catch (error) {
			console.log(error);
			throw new Error('No ethereum object!');
		}
	};

	// Connect the wallet
	const connectWallet = async () => {
		try {
			if (!ethereum) return alert('Please install metamask!');

			// Get the metamask request account(open the select account page)
			const accounts = await ethereum.request({
				method: 'eth_requestAccounts',
			});

			// set the account[0] to connectAccount
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
			throw new Error('No ethereum object!');
		}
	};

	// Sending the transaction to another address(user)
	const sendTransaction = async () => {
		try {
			const { addressTo, amount, keyword, message } = formData;
			const transactionContract = getEthereumContract();

			// Transfer amount to gas unit
			const parsedAmount = ethers.utils.parseEther(amount);

			// gas => 0x5208 = 21000 gwei = 0.000021 ether
			// create a ethereum request
			await ethereum.request({
				method: 'eth_sendTransaction',
				params: [
					{
						from: currentAccount,
						to: addressTo,
						gas: '0x5208',
						value: parsedAmount._hex,
					},
				],
			});

			// call addToBlockchain from transactionContract
			const transactionHash = await transactionContract.addToBlockchain(
				addressTo,
				parsedAmount,
				message,
				keyword
			);

			setIsLoading(true);
			console.log(`Loading - ${transactionHash.hash}`);

			// wait the addToBlockchain finish
			await transactionHash.wait();

			setIsLoading(false);
			console.log(`Finished - ${transactionHash.hash}`);

			// Get the transactionCount and set state
			const transactionCount = await transactionContract.getTransactionCount();
			setTransactionCount(+transactionCount);

			window.location.reload();
		} catch (error) {
			console.log(error);
			throw new Error('No ethereum object!');
		}
	};

	// When user initially visit the page, check if wallet is connected and transactions is exist.
	useEffect(() => {
		checkIfWalletIsConnected();
		checkIfTransactionsExist();
	}, []);

	return (
		<TransactionContext.Provider
			value={{
				connectWallet,
				currentAccount,
				formData,
				setFormData,
				handleChange,
				sendTransaction,
				transactions,
				isLoading,
			}}
		>
			{children}
		</TransactionContext.Provider>
	);
};
