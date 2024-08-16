const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let mongoose = require('mongoose');
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));

let uri = 'mongodb+srv://souhaept:JbZpBF6oOYLUkhjF@cluster0.vgda8.mongodb.net/manage?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	console.log('Database connection successful');
	})
	.catch((err) => {
		console.error('Database connection error');
});



app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  }
});

let User = mongoose.model('User', userSchema);

const createAndSaveUser = (username, done) => {
  let u = new User({
    username: username
  });

  u.save()
    .then((doc) => {
      console.log(doc);
      done(null, doc); // Pass the saved document to the callback
    })
    .catch((err) => {
      console.error(err);
      done(err); // Pass the error to the callback
    });
};

app.post('/api/users', (req, res) => {
  createAndSaveUser(req.body.username, (err, data) => {
    if (err) {
      console.error('Error saving person:', err);
    } else {
      console.log('Person saved successfully:', data);
      exercises[req.params._id] = [];
      res.send(data);
    }
  });
  
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: err });
  }
});

const findUser = async (id) => {
  try {
    const user = await User.findOne({ _id: id });
    return user;
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la recherche de l\'utilisateur', error: err });
  }
};

var exercises = {};
app.post('/api/users/:_id/exercises', async (req, res) => {
  description = req.body.description;
  duration = parseInt(req.body.duration);
  date = req.body.date || new Date();
  if (exercises[req.params._id] == undefined) {
    exercises[req.params._id] = [];
  }
  exercises[req.params._id].push({"description": description, "duration": duration,"date": new Date(date).toDateString()});
  console.log(exercises);
  try {
    const user = await findUser(req.params._id);
    if (user) {
      res.json({
        username: user.username,
        description: description,
        duration: duration,
        date: new Date(date).toDateString(),
        _id: req.params._id
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la recherche de l\'utilisateur', error: err.message });
  }
  
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const user = await findUser(req.params._id);
    if (user) {
      if (exercises[req.params._id] == undefined) {
        exercises[req.params._id] = [];
      }
      let filteredLogs = exercises[req.params._id];
      if (from) {
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= from);
      }
      if (to) {
        filteredLogs = filteredLogs.filter(log => new Date(log.date) <= to);
      }
      if (limit) {
        filteredLogs = filteredLogs.slice(0, limit);
      }
      res.json({
        username: user.username,
        count: filteredLogs.length,
        _id: req.params._id,
        log: filteredLogs
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la recherche de l\'utilisateur', error: err.message });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
