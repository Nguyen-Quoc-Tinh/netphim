const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        await User.updateOne({ username: 'admin' }, { passwordRaw: 'admin123' });
        console.log('Admin passwordRaw updated');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
