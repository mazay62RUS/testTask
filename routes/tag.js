const validator = require('validator')
const db = require('../db/db')
const jwt = require('jsonwebtoken')
const { generateJwtToken, checkAccessByJwt, SECRET_KEY } = require('../config/config.js')

const createTag = (req, res) => {

    const requestJwtToken = req.headers.authorization.split(' ')[1]

    let decodedUid = ''
    jwt.verify(requestJwtToken, SECRET_KEY, (err, decoded) => {
        if ( err ) {
            res.status(400).json("invalid token")
        } else {
            decodedUid = decoded.uid
        }
    })

    let queryStr = `INSERT INTO Tag (creator, name, sortOrder)
                    VALUES ('${decodedUid}', '${req.body.name}', '${req.body.sortOrder}') RETURNING *;`

    db.query(queryStr, (err, data) => {
        if ( err ) {
            if ( err.constraint == 'tag_name_key' ) {
                res.status(400).json("tag name must be unique")
                return
            }
            if ( err.code == '22001' ) {
                res.status(400).json("too long name length")
                return
            }
            res.status(400).json("bad request")

        } else {
            console.log(data.rows)
            res.status(200).json({
                "id": data.rows[0].id,
                "name": data.rows[0].name,
                "sortOrder": data.rows[0].sortorder

            })
        }
    })

}

const getTagById = (req, res) => {

    let tagId = req.params.id

    const getTag = `
                    SELECT name, sortOrder, creator FROM Tag
                    WHERE id = '${tagId}';
                   `

    db.query(getTag, (err, data) =>{
        if ( err )
            res.status(400).json("bad request")
        else {
            console.log(data)
            if (data.rowCount == 0) {
                res.status(400).json("cannot get tag by id")
                return
            }
            const userUid = data.rows[0].creator
            const getCreatorByUid = `
                                    SELECT nickname, uid FROM Users
                                    WHERE uid = '${userUid}';
                                    `
            db.query(getCreatorByUid, (err, dataSecond) => {
                if ( err ) res.status(400).json("bad request")
                else {
                    res.status(200).json({
                        "creator": {
                            "nickname": dataSecond.rows[0].nickname,
                            "uid": userUid
                          },
                          "name": data.rows[0].name,
                          "sortOrder": data.rows[0].sortorder
                    })
                }
            })
        }
    })

}

const changeTagById = (req, res) => {

    const tagId = req.params.id

    let decodedUid = ''
    jwt.verify(req.headers.authorization.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if ( err ) {
            res.status(400).json("invalid token")
        } else {
            decodedUid = decoded.uid
        }
    })

    const checkAccessUserQuery = `
                                SELECT * FROM Tag WHERE creator = '${decodedUid}' and id = '${tagId}'
                               `
    console.log(req.body)
    // формируем строку запроса
    let changeTagById = 'UPDATE Tag SET '
    if (req.body.name != '') changeTagById += `name = '${req.body.name}', `
    if (req.body.sortOrder != '') changeTagById += `sortorder = '${req.body.sortOrder}',`
    changeTagById = changeTagById.slice(0, -1)
    changeTagById += ` WHERE id = '${tagId}' RETURNING *;`
    console.log(changeTagById)

    const getUserData = `SELECT nickname, uid FROM Users WHERE uid = ${decodedUid}`

    db.query(checkAccessUserQuery, (err, data) => {
        if ( err ) {
            res.status(403).json("access denied")
            return
        }
        else {
            db.query(changeTagById, (err, dataSecond) => {
                if (err) {
                    res.status(400).json("bad request")
                }
                else {
                    console.log(data.rows)
                    db.query(getUserData, (err, dataUser) => {
                        if (err) res.status(400).json("bad request")
                        else {
                            res.status(200).json({
                                "creator": {
                                  "nickname": dataUser.rows[0].nickname,
                                  "uid": dataUser.rows[0].uid
                                },
                                "name": dataSecond.rows[0].name,
                                "sortOrder": dataSecond.rows[0].sortorder
                            })
                        }
                    })

                }
            })
        }
    })

}

const deleteTagById = (req, res) => {
    let tagId = req.params.id
    let decodedUid
    jwt.verify(req.headers.authorization.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if ( err ) {
            res.status(400).json("invalid token")
        } else {
            decodedUid = decoded.uid
        }
    })
    const deleteTag = `DELETE FROM Tag WHERE id = '${tagId}' AND creator = '${decodedUid}';`

    db.query(deleteTag, (err) => {
        if (err) res.status(400).json("bad request")
        else res.status(200).json("OK deleted")
    })

}

const getMyTags = (req, res) => {
    let decodedUid
    jwt.verify(req.headers.authorization.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if ( err ) {
            res.status(400).json("invalid token")
        } else {
            decodedUid = decoded.uid
        }
    })

    const myTags = `SELECT id, name, sortOrder FROM Tag WHERE creator = '${decodedUid}';`

    db.query(myTags, (err, data) => {
        if ( err ) res.status(400).json("bad request")
        else {
            res.status(200).json({
                "tags": data.rows
            })
        }
    })

}

module.exports = { createTag, getTagById, changeTagById, deleteTagById, getMyTags }