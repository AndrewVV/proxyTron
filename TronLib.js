require('dotenv').config();
const TronWeb = require('tronweb')
const fetch = require('node-fetch'); 

const fullNode = new TronWeb.providers.HttpProvider(process.env.TRON_TESTNET_NODE);
const solidityNode = new TronWeb.providers.HttpProvider(process.env.TRON_TESTNET_NODE);
const eventServer = process.env.TRON_TESTNET_NODE;

class TronLib {
	constructor(){	
		this.tronWeb = new TronWeb(
    		fullNode,
    		solidityNode,
    		eventServer,
		);
		// for test
		// this.getBalance(false, process.env.TEST_ADDRESS)
		// this.sendTransaction("THouzVw4rA4i6Y191nVmYQtXXtePMU7s2J", 1.2345)
		// this.generateAccount()
		// this.getTxInfo(process.env.TEST_ADDRESS, '1562770548000')
	}

	async generateAccount(){
    	try{
			const url = `${process.env.TRON_TESTNET_NODE}/wallet/generateaddress`
			let pair = await this.postMethod(url)
			let data = {
				address: pair.address,
				privateKey: pair.privateKey
			}
			console.log(data)
			return data;
		}catch(e){
    	    return e;
		}
	}

	async getBalance(integer=true, address){
    	try {
            let balance = await this.tronWeb.trx.getBalance(address);
            if(!integer){
                balance = this.tronWeb.fromSun(balance);
			}
			console.log(balance)
			return balance
    	} catch (error) {
			console.error("Error", error)
	    }
	}
	
	async sendTransaction(to, amount){
    	try {
            amount = this.tronWeb.toSun(amount);
            const from = process.env.TEST_ADDRESS;
            const privateKey = process.env.TEST_PRIVATEKEY;
			const transaction = await this.tronWeb.transactionBuilder.sendTrx(to, amount, from);
			const signedTransaction = await this.tronWeb.trx.sign(transaction, privateKey);
			const result = await this.tronWeb.trx.sendRawTransaction(signedTransaction);
            const txHash = result.transaction.txID
            console.log('txHash', txHash)
			return txHash;
    	} catch (error) {
            console.error(error);
    	}
	}

    async getTxInfo(address, minTimestamp){
    	try{
			let result = [];
			const url = `${process.env.TRON_TESTNET_NODE}/v1/accounts/${address}/transactions?only_to=true&min_timestamp=${minTimestamp}`;
			let allTx = await this.getMethod(url)
			allTx = allTx.data;
			for(let txKey in allTx){
				let tx = allTx[txKey];
				if(tx.raw_data != undefined){
					if(tx.raw_data.contract[0].type === "TransferContract"){
						let hash = tx.txID;
						const txFee = this.tronWeb.fromSun(tx.ret[0].fee);
						let amount = tx.raw_data.contract[0].parameter.value.amount;
						amount = this.tronWeb.fromSun(amount)
						let timeStamp = tx.raw_data.timestamp;
						timeStamp = parseInt(timeStamp/1000);
                        const from = TronWeb.address.fromHex(tx.raw_data.contract[0].parameter.value.owner_address);
                        const to = TronWeb.address.fromHex(tx.raw_data.contract[0].parameter.value.to_address);
						let status = tx.ret[0].contractRet;
						let action;
                        if(address == to){
                            action = "DEPOSIT";
                        }else if(address == from){
                            action = "SEND";
                        }
						const id = result.length+1;
						let txData = this.formatTxData(timeStamp, id, action, status, amount, hash, from, to, txFee);
                        result.push(txData);
					} continue;
				}
			}
			console.log(result)
			return result
    	}catch(e){
    	    console.error(e);
    	}
	}

    formatTxData(timeStamp, id, action, status, amount, hash, from, to, txFee){
		let txData = {
            timeStamp,
            id,
            action,
            status,
            cryptoAmount: amount,
            hash,
            fromAddress: from,
            toAddress: to,
            txFee, 
		};
		return txData;
    }

	async getMethod(url){
		try{
			const result = await fetch(url)
			.then(res => {
				return res.json()
			})
			return result;
		}catch(e){
    		return e;
		}
	}

	async postMethod(url, body={}){
		try{
			let options= {
				method: 'POST',
            	body: JSON.stringify(body),
            	headers: {
					"Content-Type": "application/json"
				}
        	};
			const result = await fetch(url, options)
			.then(res => {
				return res.json()
			})
			return result;
		}catch(e){
    		return e;
		}
	}

}

module.exports = TronLib;