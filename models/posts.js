import mongoose from 'mongoose'

const Schema = mongoose.Schema

const postSchema = new Schema({
  title: {
    type: String,
    required: [true, '缺少文章標題']
  },
  image: {
    type: [String],
    required: [true, '缺少文章封面']
  },
  content: {
    type: String,
    required: [true, '缺少文章內容']
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    required: [true, '缺少文章類型']
  },
  isEnabled: {
    // 1 = 正常發佈
    // 0 = 停止發佈
    type: Number,
    default: 1
  }
}, { versionKey: false })

export default mongoose.model('posts', postSchema)
