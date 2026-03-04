const userService = require('../services/user');

async function getUsers(req, res){
    try {
        const users = await userService.getUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

async function searchUsersController(req, res){
    try {
        const { query } = req.params;
        const users = await userService.searchUsers( query )
        return res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = { 
    getUsers,
    searchUsersController
}