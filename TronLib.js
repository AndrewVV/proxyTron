const TronWeb = require('tronweb')
const WeiConverter = require('./WeiConverter');
const HttpProvider = TronWeb.providers.HttpProvider;
const CryptoUtils = require("@tronscan/client/src/utils/crypto");
const TransactionUtils = require("@tronscan/client/src/utils/transactionBuilder");

const fullNode = new HttpProvider('https://api.shasta.trongrid.io');
const solidityNode = new HttpProvider('https://api.shasta.trongrid.io');
const eventServer = 'https://api.shasta.trongrid.io';

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
		// test send tx
		//this.sendTx("TPQX3pUVN1S7JcaVMVMVDBptxAR4WVMkSV", 2000000)
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
	
	//  doesn`t work
	generateAccount(){
		return new Promise(async(resolve,reject)=>{
    	    try{
				let pair;
				let data = {
					publicKey: pair.publicKey(),
					secretKey: pair.secret()
				}
				return resolve(data)
			}catch(e){
    	        return reject(e);
			}
		})
	} 

	toDecimals(amount, decimals=6){
        return WeiConverter.formatToDecimals(amount, decimals);
    }
    fromDecimals(amount, decimals=6){
        return WeiConverter.formatFromDecimals(amount, decimals);
    }
}

module.exports = TronLib;