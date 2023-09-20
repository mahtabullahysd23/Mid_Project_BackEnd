const Wallet = require("../model/WalletClass");
const response = require("../utility/common");
const HTTP_STATUS = require("../constants/statusCodes");
const jsonWebtoken = require("jsonwebtoken");
const { validationResult } = require("express-validator");

class WalletController{
    async add(req,res){
        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return response(res,HTTP_STATUS.BAD_REQUEST,"Validation Error",errors.array());
            }
            const user_id = req.user;
            const wallet = await Wallet.findOne({user:user_id})
            if(!wallet){
                const wallet = {
                    user:user_id,
                    balance:0,
                    currency:"Taka",
                    debitTransactions:[],
                    creditTransactions:[]
                }
                await Wallet.create(wallet);
            }
            const addInfo = req.body;
            const addBalance = await Wallet.findOneAndUpdate({user:user_id},{$inc:{balance:addInfo.amount},$push:{creditTransactions:{amount:addInfo.amount,timestamp:Date.now()}}});
            if(addBalance){
                return response(res,HTTP_STATUS.OK,"Balance Added Successfully",addInfo);
            }
            return response(res,HTTP_STATUS.BAD_REQUEST,"Balance Not Added");
        }
        catch(e){
            return response(res,HTTP_STATUS.INTERNAL_SERVER_ERROR,"Internal Server Error");
        }

    }

    async getMyWallet(req,res){
        try{
            const user_id = req.user;
            const wallet = await Wallet.findOne({user:user_id}).populate("debitTransactions","-__v -user -cart -status -updatedAt -books").select("-__v -user");
            if(!wallet){
                return response(res,HTTP_STATUS.BAD_REQUEST,"Add Balance to Wallet first");
            }
            return response(res,HTTP_STATUS.OK,"Wallet Found",wallet);
        }
        catch(e){
            return response(res,HTTP_STATUS.INTERNAL_SERVER_ERROR,"Internal Server Error");
        }

    }
}

module.exports = new WalletController();