import mongoose from 'mongoose'

const Schema = mongoose.Schema

const reportSchema = new Schema({
  recipe: {
    type: Schema.Types.ObjectId,
    ref: 'recipes'
  },
  comment_id: {
    type: String,
    required: [true, '缺少檢舉留言id']
  },
  reason: {
    type: String,
    required: [true, '缺少檢舉原因']
  },
  reportuser: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  commentuser: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  status: {
    // 處理狀態
    // 1 = 已解決
    // 0 = 待解決
    type: Number,
    default: 0
  }
}, { versionKey: false })

export default mongoose.model('reports', reportSchema)
