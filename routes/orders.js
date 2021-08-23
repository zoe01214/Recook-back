import express from 'express'
import auth from '../middleware/auth.js'
import { neworders, getorders, editorders, getallorders } from '../controllers/orders.js'

const router = express.Router()

router.post('/', auth, neworders)
router.patch('/:id', auth, editorders)
router.get('/all', auth, getallorders)
router.get('/', auth, getorders)

export default router
