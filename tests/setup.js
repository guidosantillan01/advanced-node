jest.setTimeout(30000);

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise; // Implements the nodejs global Promise, not the mongoose embedded one.
mongoose.connect(keys.mongoURI, { useMongoClient: true });
