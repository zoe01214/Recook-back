import express from 'express'
import auth from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { newRecipe, getRecipe, editRecipe, getRecipeById, delRecipeById, postmsg, editmsg } from '../controllers/recipes.js'

const router = express.Router()

router.post('/', auth, upload, newRecipe)
router.get('/', getRecipe)
router.get('/:id', getRecipeById)
router.patch('/del/:id', auth, delRecipeById)
router.patch('/msg/:id', auth, postmsg)
router.patch('/msgedit/:id', auth, editmsg)
router.patch('/:id', auth, upload, editRecipe)

export default router
