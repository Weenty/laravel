const {pool, constants} = require('../../dependencies')
const getSchedule = require('../../services/libs/excelparser')

async function getUserSchedule(user) {
    let data = {
        message: '',
        statusCode: 400
    }
    console.log(user)
    const client = await pool.connect()
    try {
        const querySeletUser = `SELECT *
                                FROM users
                                WHERE id = $1`
        const resSelectUser = await client.query(querySeletUser,
            [
                user.userId
            ])
        if (resSelectUser.rows.length > 0) {
            const querySelectGroup = `SELECT *
                                      FROM groups
                                      WHERE id = $1`
            const resSelectGroup = await client.query(querySelectGroup,
                [
                    resSelectUser.rows[0].groupId
                ])
            if (resSelectGroup.rows.length > 0) {
                data = {
                    message: await getSchedule.getSchedule(resSelectGroup.rows[0].code),
                    statusCode: 200
                }
            } else {
                data = {
                    message: 'Ошибка получения информации о группе',
                    statusCode: 400
                }
            }

        } else {
            data = {
                message: 'Ошибка получения пользователя по id из токена',
                statusCode: 400
            }
        }
    } catch (e) {
        data = {
            message: e.message,
            statusCode: 400
        }
    }finally {
        client.release()
    }
    return data
}

module.exports = {
    getUserSchedule: getUserSchedule
}