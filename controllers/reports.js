import reports from '../models/reports.js'
import users from '../models/users.js'

export const reportmsg = async (req, res) => {
  if (!req.user._id) {
    res.status(403).send({ success: false, message: '請登入後再進行操作' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    await reports.create(req.body)
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    console.log(error.code)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else if (error.name === 'MongoError' && error.code === 11000) {
      res.status(400).send({ success: false, message: '檢舉已存在' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const solveReport = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有操作權限' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const result = await reports.findByIdAndUpdate(req.body._id, { status: req.body.status }, { new: true })
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error.code)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else if (error.name === 'MongoError' && error.code === 11000) {
      res.status(400).send({ success: false, message: '檢舉已存在' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const getreport = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限取得資料' })
  }
  try {
    const result = await reports.find().populate('reportuser', 'account _id').populate('commentuser', 'account _id').populate('recipe', 'name _id comments')
    
    res.status(200).send({ success: true, message: '', result})
  } catch (error) {
    console.log(error.code)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).send({ success: false, message: message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}
