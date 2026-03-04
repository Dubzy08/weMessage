const User = require('../models/user');

async function getUsers(){
    const users = await User.find({});
    return users;
};

async function searchUsers(query){
    return await User.find({
        name: { $regex: query, $options: 'i' }
    }).select('_id name').limit(10);
}

module.exports = { 
    getUsers,
    searchUsers
};