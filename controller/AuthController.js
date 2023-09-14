const User = require("../model/UserClass");
const Auth = require("../model/AuthClass");
const  response  = require('../utility/common');
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jsonWebtoken = require("jsonwebtoken");
class Authcontroller {
    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response(res,400,"Validation Error", errors.array())
            }
            const { email, password } = req.body;
            const user = await Auth.findOne({ 'email.id': email }).populate('user', '-__v');
            if (!user) {
                return response(res,400,"Invalid Credentials")
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                const updateAttempt = await Auth.findOneAndUpdate(
                    { 'email.id': email },
                    { $inc: { attempt: 1 } }
                );

                if (updateAttempt.attempt >= 3) {
                    await Auth.findOneAndUpdate(
                        { 'email.id': email },
                        { $set: { locked: true, unloackTime: Date.now() + 24 * 60 * 60 * 1000 } }
                    );
                    return response(res,404,"Too Many attempts, Your account is blocked for 24 hours");
                }
                return response(res,400,"Invalid Credentials");
            }
            if (user.locked && user.unloackTime > Date.now()) {
                return response(res,404,"Too Many attempts, Your account is blocked for 24 hours");
            }
            if (!user.email.status) {
                return response(res,400,"Please verify your email");
            }
            const tokenExpiration = '24h';
            const token = jsonWebtoken.sign({ data: user }, process.env.JWT_KEY, { expiresIn: tokenExpiration });
            await Auth.findOneAndUpdate(
                { 'email.id': email },
                { $set: { locked: false, unloackTime: Date.now(), attempt: 0 } }
            );
            return response(res,200,"Successfully Logged in", {
                user: user.user,
                token: token
            });
        } catch (e) {
            return response(res,500,"Internal Server Error");
        }
    }

    async signUp(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response(res,400,"Validation Error", errors.array())
            }

            const { name, email, address, password } = req.body;

            const existEmail = await Auth.findOne({ 'email.id': email.id });

            if (existEmail) {
                if (existEmail.email.status === true) {
                    return response(res,400,"Email already exists");
                } else {
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(password, salt);

                    const updatedAuth = await Auth.findOneAndUpdate(
                        { 'email.id': email.id },
                        { $set: { password: hash } }
                    );

                    const updateUser = await User.findOneAndUpdate(
                        { 'email': email.id },
                        { $set: { name: name, address: address } }
                    );

                    if (updatedAuth && updateUser) {
                        const upauthfound = await Auth.findOne({ 'email.id': email.id }).select('-email -password -attempt -locked -unloackTime -__v').populate('user','-__v');
                        return response(res,200, "Successfully Registered", upauthfound);
                    }
                }
            } else {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);

                const user = await User.create({ name, email: email.id, address });
                const auth = await Auth.create({ email, password: hash, user: user._id });

                if (user && auth) {
                    const authfound = await Auth.findOne({ 'email.id': email.id }).select('-email -password -attempt -locked -unloackTime').populate('user','-__v');
                    console.log("authfound");
                    return response(res,200, "Successfully Registered", authfound);
                }
            }
            return response(res,404,"Registration failed")
        } catch (e) {
            return response(res,500,"Internal server error")
        }
    }

}

module.exports = new Authcontroller();