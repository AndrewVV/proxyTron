const TronWeb = require('tronweb')
const fetch = require('node-fetch'); 
const DecimalConverter = require('./DecimalConverter');
const HttpProvider = TronWeb.providers.HttpProvider;
const CryptoUtils = require("@tronscan/client/src/utils/crypto");

const fullNode = new HttpProvider('https://api.shasta.trongrid.io');
const solidityNode = new HttpProvider('https://api.shasta.trongrid.io');
const eventServer = 'https://api.shasta.trongrid.io';
const fullMainNode = 'https://api.trongrid.io';

// testnet privkey
const privateKey = '0560d5eed51ff19c1ae98da2a5be0ca0b3a9d71ebad10c407db0f8cb093d47b0';

class TronLib {
	constructor(){	
		this.tronWeb = new TronWeb(
    		fullNode,
    		solidityNode,
    		eventServer,
    		privateKey, 
		);

		// test
		//this.getTxInfo('TE771U5EEQ9PAVQZsv95DqVGwjEFHaaP9y', '1562770548000')
	}

	generateAccount(){
		return new Promise(async(resolve,reject)=>{
    	    try{
				let url = fullMainNode+'/wallet/generateaddress'
				let pair = await this.postMethod(url)
				let data = {
					address: pair.address,
					privateKey: pair.privateKey
				}
				return resolve(data)
			}catch(e){
    	        return reject(e);
			}
		})
	}

	getBalance(address){
    	return new Promise(async(resolve,reject)=>{
    	    try{
				let balance = await this.tronWeb.trx.getBalance(address)
				balance = this.toDecimals(balance)
				return resolve(balance)
    	    }catch(e){
    	        return reject(e);
    	    }
		})
	}

	sendTx(to, amount){
    	return new Promise(async(resolve,reject)=>{
    	    try{
				let from = CryptoUtils.pkToAddress(privateKey);
				let transaction = await this.tronWeb.transactionBuilder.sendTrx(to, amount, from, 1);
				let signedTransaction = await this.tronWeb.trx.sign(transaction, privateKey)
				let result = await this.tronWeb.trx.sendRawTransaction(signedTransaction)
				result = result.transaction.txID
				return resolve(result)
    	    }catch(e){
    	        return reject(e);
    	    }
		})
	}

    getTxInfo(address, minTimestamp){
    	return new Promise(async(resolve,reject)=>{
    	    try{
				let result = [];
				let url = fullMainNode+'/v1/accounts/'+address+'/transactions?only_to=true&min_timestamp='+minTimestamp
				let allTx = await this.getMethod(url)
				allTx = allTx.data;
				for(let txKey in allTx){
					let tx = allTx[txKey];
					if(tx.raw_data != undefined){
						if(tx.raw_data.contract[0].type === "TransferContract"){
							let hash = tx.txID;
							let amount = tx.raw_data.contract[0].parameter.value.amount;
							amount = this.toDecimals(amount)
							let timestamp = tx.raw_data.timestamp;
							let txData = await this.formatTxData(hash, amount, timestamp);
							result.push(txData)
						}
					}
				}
				console.log(result)
				return resolve(result)
    	    }catch(e){
    	        return reject(e);
    	    }
		})
	}

	formatTxData(hash, amount, timestamp){
		let txData = {
			txHash: hash,
			amount: amount, 
			timestamp: timestamp
		};
		return txData;
	}

	getMethod(url){
		return new Promise(async(resolve,reject)=>{
			try{
				let result = await fetch(url)
				.then(function(responce) {
					return responce.json()
				})
				return resolve(result);
			}catch(e){
    	    	return reject(e);
			}
		})
	}

	postMethod(url, body={}){
		return new Promise(async(resolve,reject)=>{
			try{
				let options= {
					method: 'POST',
                	body: JSON.stringify(body),
                	headers: {
						"Content-Type": "application/json"
					}
            	};
				let result = await fetch(url, options)
				.then(function(responce) {
					return responce.json()
				})
				return resolve(result);
			}catch(e){
    	    	return reject(e);
			}
		})
	}

	toDecimals(amount, decimals=6){
        return DecimalConverter.formatToDecimals(amount, decimals);
    }
    fromDecimals(amount, decimals=6){
        return DecimalConverter.formatFromDecimals(amount, decimals);
    }
}

module.exports = TronLib;