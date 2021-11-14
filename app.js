const express = require('express')
const cors = require('cors')
const app = express()
const authControllers = require('./routes/authControllers')
const user = require('./routes/user')
const tag  = require('./routes/tag')

const PORT = process.env.PORT || 1337;

global.jwtBlackList = []

app.use(cors())
app.use(express.json())

app.use('/signin', cors(), authControllers.signin)
app.use('/login', cors(), authControllers.login)
app.use('/logout', cors(), authControllers.logout)
app.use('/refreshToken', cors(), authControllers.refreshToken)

app.route('/user', cors())
	.all(user.isAccessed)
	.get(user.getUser)
	.delete(user.deleteUser)
	.put(user.putUser)

app.route('/tag', cors())
	.all(user.isAccessed)
	.post(tag.createTag)

app.route('/tag/:id', cors())
	.all(user.isAccessed)
	.get(tag.getTagById)
	.put(tag.changeTagById)
	.delete(tag.deleteTagById)

app.route('/user/tag/my', cors())
	.all(user.isAccessed)
	.get(tag.getMyTags)

//app.get('/tag/:id', cors(), tag.getTagById)
//app.put('/tag/:id', cors(), tag.changeTagById)

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`)
})