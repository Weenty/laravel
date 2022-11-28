const {pool} = require("../../dependencies");

async function getMessages(object, user, list) {
    let data = {
        message: '',
        statusCode: 400
    }
    const client = await pool.connect()
    const userId = user.userId
    const entriesOnPage = 5;
    let listLimit = list * entriesOnPage - entriesOnPage

    try {
        const qCount = await client.query(`select count(*)::integer  from usermessages where "userId" = $1`,[user.userId])
        const querySelectAllMessages = `SELECT *
                                        FROM usermessages um
                                                 LEFT JOIN messages m on um."messageId" = m.id
                                        WHERE "userId" = $1
                                        ORDER BY m.date DESC
                                        OFFSET $2 LIMIT $3`
        const resSelectAllMessages = await client.query(querySelectAllMessages,
            [
                userId,
                listLimit,
                entriesOnPage
            ])
        data = {
            message: resSelectAllMessages.rows,
            statusCode: 200,
            count:qCount.rows[0].count
        }
    } catch (e) {
        console.log(e)
        data = {
            message: e,
            statusCode: 400
        }
    } finally {
        client.release()
        console.log('client.release')
    }
    return data
}

async function getInfoAboutMessage(object, user, id) {
    let data = {
        message: '',
        statusCode: 400
    }
    const client = await pool.connect()
    try {
        const querySelectMessage = `SELECT *
                                    FROM messages
                                    WHERE "id" = $1`
        const resSelectMessage = await client.query(querySelectMessage,
            [
                id
            ])
        if (resSelectMessage.rows.length > 0) {
            data = {
                message: resSelectMessage.rows[0],
                statusCode: 200
            }
        } else {
            data = {
                message: `Сообщения с id ${id} не существует`,
                statusCode: 400
            }
            console.log(`Сообщения с id ${id} не существует`)
        }
    } catch (e) {
        console.log(e)
    } finally {
        client.release()
        console.log('client.release()')
    }
    return data
}

async function createMessage(object, user) {
    let data = {
        message: '',
        statusCode: 400
    }
    const client = await pool.connect()
    const userId = user.userId
    const role = user.role
    try {
            //todo сделать для админа
    } catch (e) {
        console.log(e)
    } finally {
        client.release()
        console.log('client.release()')
    }
    return data
}

module.exports = {
    getMessages: getMessages,
    getInfoAboutMessage: getInfoAboutMessage
}