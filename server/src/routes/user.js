const express = require('express');
// const cors = require('cors');
const userController = require('../controllers/user');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// router.use(cors());

router.get('/users', authMiddleware.authenticateToken, userController.getUsers)
router.get('/search/:query', userController.searchUsersController)

module.exports = router;