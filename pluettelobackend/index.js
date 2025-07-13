require('dotenv').config();
const express = require('express');
const User = require('./models/user');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Kustomoitu tokeni, joka palauttaa pyynnön sisällön
morgan.token('content', function (req, res) {
  return JSON.stringify(req.body);
});
// Käytetään morgan:ia hakujen loggaamiseen
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms')
);

// Generaalinen error handler

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: '1',
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: '2',
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: '3',
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: '4',
  },
];
// root sivu
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

// kaikkien henkilöiden sivu
app.get('/api/persons', (request, response) => {
  User.find({}).then((users) => response.json(users));
});

// infosivu, saadaan tiedot mongodb kannasta mongoosen countDocuments -metodin avulla
app.get('/info', (request, response) => {
  User.countDocuments({}).then((count) =>
    response.send(
      `<p>Phonebook has info for ${count} people </p><p>${new Date()}</p>`
    )
  );
});

// yksittäisen henkilön sivu
app.get('/api/persons/:id', (request, response, next) => {
  User.findById(request.params.id)
    .then((user) => {
      if (user) {
        response.json(user);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// Käsitellään käyttäjän päivittäminen

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  User.findById(request.params.id)
    .then((user) => {
      if (!user) {
        return response.status(404).end();
      }

      user.name = name;
      user.number = number;

      return user.save().then((updatedUser) => {
        response.json(updatedUser);
      });
    })
    .catch((error) => next(error));
});

// henkilön poisto
app.delete('/api/persons/:id', (request, response, next) => {
  User.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// henkilön lisäys, logataan tässä myös pyynnön sisältö eli lisättävä henkilö
app.post('/api/persons', morgan(':content'), (request, response, next) => {
  // generoidaan random id
  const id = Math.floor(Math.random() * (50 - 10) + 10);
  const person = request.body;
  // katsotaan onko duplikaatteja (ei toimi nyt, koska listan sijasta tiedot haetaan tietokannasta)
  const duplicates = persons.filter(
    (person) => person.name === request.body.name
  );
  if (!person.name) {
    return response.status(400).json({ error: 'name is mandatory' });
  } else if (!person.number) {
    return response.status(400).json({ error: 'number is mandatory' });
  } else if (duplicates.length !== 0) {
    return response.status(400).json({ error: 'name must be unique' });
  }

  // Luodaan uusi käyttäjä mongodb -kantaan
  const user = new User({
    name: person.name,
    number: person.number,
    id: id,
  });
  user
    .save()
    .then((savedUser) => {
      response.json(savedUser);
    })
    .catch((error) => next(error));

  // Vanha tapa kovakoodattuun listaan lisäämiseen------------------------
  // person.id = String(id);
  // persons = persons.concat(person);
  // response.json(person);
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
