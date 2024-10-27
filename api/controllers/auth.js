import { db } from "../db.js";
import bcrypt from "bcryptjs";
const { hash, genSaltSync, hashSync, compareSync } = bcrypt;//chatgpt solved error
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
export const register = (req, res) => {
    // check for existing user
    const q = "SELECT * FROM users WHERE email= ? OR username = ?";
    db.query(q, [req.body.email, req.body.name], (err, data) => {
        if (err) return res.json(err);
        //if error comes that means this user doesn't exist in the DB
        if (data.length) return res.status(409).json("User already exists!");


        // Hash the password & create a user
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);


        const q = "INSERT INTO users(`username`,`email`,`password`) VALUES (?)";


        const values = [
            req.body.username,
            req.body.email,
            hash,
        ]


        db.query(q, [values], (err, data) => {
            if (err) return res.json(err);
            return res.status(200).json("User has been created.");
        })


    });
};
export const login = (req, res) => {
    // check if user exists or not
    const q = "SELECT * FROM users WHERE username = ?"


    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.json(err);
        if (data.length == 0) return res.status(404).json("User not found!");


        //check password
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password);


        if (!isPasswordCorrect) 
            return res.status(400).json("Wrong username or password!");


        // if token id is same as id in post then you can edit the post
        const token = jwt.sign({ id: data[0].id }, "jwtkey");


        const { password, ...other } = data[0];

        // no scripts in the backend will affect it
        // only used for api requests
        
        res.cookie("access_token", token, {
            httpOnly: true
        }).status(200).json(other);


    });
};
export const logout = (req, res) => {
    res.clearCookie("access_token",{
        sameSite:"none",
        secure:true
    }).status(200).json("User has been logged out.")

};

