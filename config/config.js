const jwt = require('jsonwebtoken')

const SECRET_KEY = 'secret-key'

const generateJwtToken = (email, uid) => {

	const payload = {
		email,
        uid
	}

	return jwt.sign(payload, SECRET_KEY, { expiresIn: '6h' })
}

const checkAccessByJwt = (accessJwtToken) => {

    let returnState

    if ( accessJwtToken === undefined ) {
        returnState = false
    }

    const requestJwtToken = accessJwtToken.split(' ')[1]

    /*if ( requestJwtToken in global.jwtBlackList ) {
        returnState = false   
    }*/

    jwt.verify(requestJwtToken, SECRET_KEY, (err, decoded) => {
        if ( err ) {
            returnState = false
        }
        
        if (decoded) returnState = true

    })
    
    return returnState

}

module.exports = { generateJwtToken, checkAccessByJwt, SECRET_KEY }