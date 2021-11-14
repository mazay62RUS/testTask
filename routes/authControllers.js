const express = require('express')
const validator = require('validator')
const bcrypt = require('bcrypt')
const db = require('../db/db')
const jwt = require('jsonwebtoken')
const JwtToken = require('../config/config.js')

const signin = (req, res) => {
	console.log(req.body)

	// проходим валидацию
	let isNotValidation = 
	!validator.isEmail(req.body.email) ? 
	res.status(400).end('invalid email') :
	!validator.isStrongPassword(req.body.password, { minLength: 8, minLowercase: 1, minUppercase: 1, pointsForContainingNumber: 1 }) ?
	res.status(400).end('invalid password') :
	req.body.nickname.trim() == "" ?
	res.status(400).end('nickname is empty') : ''

	if (isNotValidation) return

	const hashPassword = bcrypt.hashSync(req.body.password, 6)

    let getUid = `
                 SELECT uid FROM Users
                 WHERE email = '${req.body.email}';
                 `

	let queryStr = `INSERT INTO Users (email, password, nickname)
					VALUES ('${req.body.email}', '${hashPassword}', '${req.body.nickname}');`
	
	db.query(queryStr, (err, data) => {

		if (err) {

			// проверяем на уникальность
			(err.constraint == 'users_email_key') || (err.constraint == 'users_password_key') ? res.status(400).end("email or password already excist") :
			(err.constraint == 'users_nickname_key') ? res.status(400).end("nickname already excist") :
			res.status(400).end("Error 400 bad request")

		} else {
            db.query(getUid, (err, data) => {
                if ( err ) res.status(400).end("Error 400 bad request")
                else {
                   let uid = data.rows[0].uid
                   const token = JwtToken.generateJwtToken(req.body.email, uid)
                   
                   res.status(200).json({
                       'token': token,
                       'expire': '30'
                   })
                }
            })
		}
	
	})
	
}

const login = (req, res) => {

	let queryStr = `
					SELECT email, password, uid FROM Users
					WHERE email = '${req.body.email}';
				   `

	db.query(queryStr, (err, data) => {

		if (err) {
			console.log(err)
		} 

		if ( data.rowCount == 0 ) {
            res.status(404).json("wrong password or email")
            return
        }

        console.log(data.rows[0].password)
        const result = bcrypt.compareSync(req.body.password, data.rows[0].password)
        if ( result ) {
            const token = JwtToken.generateJwtToken(req.body.email, data.rows[0].uid)
            res.status(200).json({
                'token': token,
                'expire': '30'
            })
        } else {
            res.status(404).json("wrong password or email")
        }

	})

}

const logout = (req, res) => {
    jwtBlackList.push(req.headers.authorization.split(' ')[1])
    res.status(200).json("OK")
}

const refreshToken = (req, res) => {

    const requestJwtToken = req.headers.authorization.split(' ')[1]

    let email, uid

    jwt.verify(requestJwtToken, JwtToken.SECRET_KEY, (err, decoded) => {
        if ( err ) {
            res.status(400).json("bad request")
            return
        }
        if (decoded) {
            email = decoded.email
            uid = decoded.uid
        }
    })

    const token = JwtToken.generateJwtToken(email, uid)

    res.status(200).json({
        "token": token,
        "expire": "30"
    })

}

module.exports = {
    signin,
    login,
    logout,
    refreshToken
}