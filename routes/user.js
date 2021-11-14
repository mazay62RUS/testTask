const validator = require('validator')
const db = require('../db/db')
const jwt = require('jsonwebtoken')
const { generateJwtToken, checkAccessByJwt, SECRET_KEY } = require('../config/config.js')

const isAccessed = (req, res, next) => {
    console.log(checkAccessByJwt(req.headers.authorization))
    if ( checkAccessByJwt(req.headers.authorization) ) {  
        next()
    } else {
        res.status(403).json("login or signin")
    }
}

const getUser = (req, res) => {

    let decodedEmail = ''

    if ( req.headers.authorization === undefined ) {
        res.status(401).json("access denied")
    }

    jwt.verify(req.headers.authorization.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if ( err ) console.log( err )
        else decodedEmail = decoded.email
    })

    const getUserData = `SELECT email, nickname, uid FROM Users WHERE email = '${decodedEmail}';`

    db.query(getUserData, (err, data) => {
        if ( err ) {
            res.status(400).json("bad request")
            return
        } else {
            const getAllUserTags = `SELECT id, name, sortOrder FROM Tag WHERE creator = '${data.rows[0].uid}';`
            db.query(getAllUserTags, (err, dataSecond) => {
                if ( err ) {
                    res.status(400).json("bad request")
                    return
                } else {
                    res.status(200).json({
                        "email": data.rows[0].email,
                        "nickname": data.rows[0].nickname,
                        "tags": dataSecond.rows
                    })
                }
            })
        }
    })


}

const deleteUser = (req, res) => {

    let decodedEmail = ''
    jwt.verify(req.headers.authorization.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if ( err ) console.log( err )
        else decodedEmail = decoded.email
    })
    console.log(decodedEmail)
    let queryStr = `
                    DELETE FROM Users WHERE email = '${decodedEmail};'
                    `

    db.query(queryStr, (err, data) => {

        if (err) {
             res.status(400).end('bad request')
             return
        }
        console.log(data)

        if (data.rowCount == 0 ) {
            res.status(404).end('user not found')
            return
        }

        global.jwtBlackList.push(decodedEmail)
        res.status(200).json("OK")
      
    })

}

const putUser = (req, res) => {

    console.log(req.body)

    // вытаскиваем email пользователя из jwt токена
    let decodedEmail = ''
    jwt.verify(req.headers.authorization.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if ( err ) console.log( err )
        else decodedEmail = decoded.email
    })

	// проходим валидацию
	let isNotValidation = 
	!validator.isEmail(req.body.email) ? 
	res.status(400).end('invalid email') :
	!validator.isStrongPassword(req.body.password, { minLength: 8, minLowercase: 1, minUppercase: 1, pointsForContainingNumber: 1 }) ?
	res.status(400).end('invalid password') :
	req.body.nickname == "" ?
	res.status(400).end('nickname is empty') : ''

	if (isNotValidation) return

    // формируем строку запроса
    let queryStr = 'UPDATE Users SET '
    if (req.body.email != '') queryStr += `email = '${req.body.email}', `
    if (req.body.password != '') queryStr += `password = '${req.body.password}', `
    if (req.body.nickname != '') queryStr += `nickname = '${req.body.nickname}',`
    queryStr = queryStr.slice(0, -1)
    queryStr += ` WHERE email = '${decodedEmail}';`

	db.query(queryStr, (err, data) => {

		if (err) {
			res.status(400).end('bad request')
		} else {
            console.log(data)
            res.status(200).json({
                "email": req.body.email,
                "password": req.body.password,
                "nickname": req.body.nickname
            })
        }

	})

}

module.exports = {
    isAccessed,
    getUser,
    deleteUser,
    putUser
}