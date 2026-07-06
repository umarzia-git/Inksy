import { Router } from 'express'
import { mysqlStatus } from '../config/mysql.js'
import { mongoStatus } from '../config/mongo.js'

export const healthRouter = Router()

healthRouter.get('/', async (req, res) => {
  res.json({
    status: 'ok',
    mysql: await mysqlStatus(),
    mongo: mongoStatus(),
  })
})
