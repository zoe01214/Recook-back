import mongoose from 'mongoose'

const Schema = mongoose.Schema

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  products: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'products',
      required: [true, '缺少商品 ID']
    },
    amount: {
      type: Number,
      required: [true, '缺少商品數量']
    }
  }],
  name: {
    type: String,
    required: [true, '缺少收件人姓名']
  },
  phone: {
    type: String,
    required: [true, '缺少收件人手機號碼']
  },
  address: {
    type: String,
    required: [true, '缺少收件人地址']
  },
  credit: {
    type: String,
    required: [true, '缺少付款資訊']
  },
  state: {
    // 0 = 訂單取消
    // 1 = 訂單成立
    // 2 = 已完成
    type: Number,
    default: 1,
    required: [true, '缺少訂單狀態']
  },
  date: {
    type: Date,
    required: [true, '缺少訂單日期']
  }
}, { versionKey: false })

export default mongoose.model('orders', orderSchema)
