const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/auth/auth');
const notesRoutes = require('./src/notes/notes');
const tasksRoutes = require('./src/tasks/tasks');


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Use authentication routes
app.use('/auth', authRoutes);

// Use notes routes
app.use('/notes', notesRoutes);

// Use tasks routes
app.use('/tasks', tasksRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});