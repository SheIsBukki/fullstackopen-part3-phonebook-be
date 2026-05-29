const express = require("express");
const app = express();
const morgan = require("morgan");
// const cors = require('cors')
app.use(express.json());

morgan.token("body", function getBody(req) {
  return JSON.stringify(req.body);
});

const reqLogger = morgan(
  function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens["response-time"](req, res),
    "-",
    tokens["total-time"](req, res),
    "ms",
    tokens['body'](req, res),
  ].join(" ");
}
);

const requestLogger = morgan(
  ":method :url :status :response-time[digits] - :total-time[digits] ms :body",
);

app.use(reqLogger);
app.use(requestLogger);
// app.use(cors())
app.use(express.static("dist"));

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.use((request, response, next) => {
  request.receivedAt = new Date().toISOString();
  next();
});

app.get("/info", (request, response) => {
  response.append("x-timestamp", request.receivedAt);
  const requestTimeDate = new Date(response.getHeader("x-timestamp"));

  response
    .status(200)
    .send(
      `<p>Phonebook has ${persons.length} people<p><p>${requestTimeDate}</p>`,
    );
});

const generateId = () => {
  const getRandomInt = () => String(Math.floor(Math.random() * 100000) + 1);
  let uniqueId = getRandomInt();

  while (persons.findIndex((person) => person.id === uniqueId) !== -1) {
    uniqueId = getRandomInt();
  }

  return uniqueId;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name and number are required" });
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);
  persons = persons.filter((p) => p.id !== person.id);
  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// const PORT = 3001;
// app.listen(PORT);
// console.log(`Listening on ${PORT}`);
