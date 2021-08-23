import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'

import userRouter from './routes/users.js'
import recipesRouter from './routes/recipes.js'
import fileRouter from './routes/files.js'
import reportsRouter from './routes/reports.js'
import postsRouter from './routes/posts.js'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'

dotenv.config()

mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })

const app = express()

app.use(cors({
  origin (origin, callback) {
    if (process.env.DEV === 'true') {
      callback(null, true)
    } else {
      if (origin === undefined || origin.includes('github')) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed'), false)
      }
    }
  }
}))

// 處理 cors 錯誤
app.use((_, req, res, next) => {
  res.status(403).send({ success: false, message: '請求被拒絕' })
})

app.use(bodyParser.json())

// 處理 body-parser 錯誤
app.use((_, req, res, next) => {
  res.status(400).send({ success: false, message: '內容格式錯誤' })
})

app.use('/files', fileRouter)
app.use('/users', userRouter)
app.use('/recipes', recipesRouter)
app.use('/reports', reportsRouter)
app.use('/posts', postsRouter)
app.use('/products', productsRouter)
app.use('/orders', ordersRouter)

// 擋住 404 不要讓 express 處理
app.all('*', (req, res) => {
  res.status(404).send({ success: false, message: '找不到內容' })
})

app.listen(process.env.PORT, () => {
  console.log('server start')
})
