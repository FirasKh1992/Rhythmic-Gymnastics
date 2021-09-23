const express = require('express');
const connectDB = require('./config/db');
const app = express();
//connect Database
connectDB();

//init Middleware
app.use(express.json({extended:false}))

app.get('/', (req, res) => {
  res.send('API  running ');
});

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/tournament', require('./routes/api/tournament'));



const PORT = process.env.Port || 5000;

app.listen(PORT, console.log(`listening on port ${PORT}`));
