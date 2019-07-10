const TronWeb = require('tronweb')
const fetch = require('node-fetch'); 
const DecimalConverter = require('./DecimalConverter');
const HttpProvider = TronWeb.providers.HttpProvider;
const CryptoUtils = require("@tronscan/client/src/utils/crypto");
const TransactionUtils = require("@tronscan/client/src/utils/transactionBuilder");

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
	
	generateAccount(){
		return new Promise(async(resolve,reject)=>{
    	    try{
				let pair = await this.postMethod(fullMainNode+'/wallet/generateaddress')
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