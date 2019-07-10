const express = require('express')
const port = 8632
let TronLib = require('./TronLib.js')

class Proxy {
	constructor(){ 
		this.app = express();
		this.tronLib = new TronLib();
		this.init()
	}

    init(){
        return new Promise(async(resolve,reject)=>{
            try{
            	this.app.listen(port, () => {
				    console.log("Server is up on port " + port)
				})

				this.app.get('/tron/balance/:address',  async (req, res) => {
    				return new Promise(async(resolve,reject)=>{
    				    try{
							let address = req.params.address;
							let balance = await this.tronLib.getBalance(address)
							balance = JSON.stringify({"balance": balance});
							res.send(balance)
    				    }catch(e){
    				        return reject(e);
    				    }
					})
				})

				this.app.post('/tron/send/:address/:amount',  async (req, res) => {
    				return new Promise(async(resolve,reject)=>{
    				    try{
							let address = req.params.address;
							let amount = req.params.amount;
							let txHash = await this.tronLib.sendTx(address, amount)
							let result = JSON.stringify({"txHash": txHash});
							res.send(result)
    				    }catch(e){
    				        return reject(e);
    				    }
					})
				})

				this.app.post('/tron/create-account',  async (req, res) => {
    				return new Promise(async(resolve,reject)=>{
    				    try{
							let data = await this.tronLib.generateAccount();
    				    	let result = JSON.stringify({"address": data.address, "privateKey": data.privateKey});
							res.send(result)
    				    }catch(e){
    				        return reject(e);
    				    }
					})
				})
            }catch (e) {
                console.log(e);
            }
        });
    }
}

let proxy = new Proxy();