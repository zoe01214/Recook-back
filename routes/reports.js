import express from 'express'
import auth from '../middleware/auth.js'
import { reportmsg, getreport, solveReport } from '../controllers/reports.js'

const router = express.Router()

router.post('/', auth, reportmsg)
router.get('/', auth, getreport)
router.patch('/', auth, solveReport)

export default router
