import posts from '../models/posts.js'

export const newposts = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限發表文章' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    const result = await posts.create({
      title: req.body.title,
      content: req.body.content,
      image: req.filepath,
      type: req.body.type,
      isEnabled: req.body.isEnabled
    })
    res.status(200).send({ success: true, message: '文章建立成功', result })
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

export const editposts = async (req, res) => {
  if (req.user.role !== 1) {
    res.status(403).send({ success: false, message: '沒有權限發表文章' })
  }
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    res.status(400).send({ success: false, message: '資料格式不正確' })
    return
  }
  try {
    console.log(req.body)
    console.log(req.filepath)
    const data = {
      title: req.body.title,
      content: req.body.content,
      type: req.body.type,
      isEnabled: req.body.isEnabled
    }
    if (req.filepath.length !== 0) {
      data.image = req.filepath
    }
    console.log(data)
    const result = await posts.findByIdAndUpdate(req.params.id, data, { new: true })
    res.status(200).send({ success: true, message: '文章建立成功', result })
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

export const getposts = async (req, res) => {
  try {
    const result = await posts.find()
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getpostsHome = async (req, res) => {
  try {
    const result = await posts.aggregate([{
      $limit: 10
    }])
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getpostsById = async (req, res) => {
  try {
    const result = await posts.findById(req.params.id)
    res.status(200).send({ success: true, meesage: '', result })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400).send({ success: false, message: '查無這筆文章' })
    }
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
