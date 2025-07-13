import axios from 'axios';
const baseUrl = '/api/persons';

const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

const create = (newObject) => {
  const request = axios.post(baseUrl, newObject);
  return request.then((response) => response.data);
};

// Ongelma, henkilön päivitys poistaa kaikki näkymästä, mutta uudelleenlataus näyttää oikein kaikki päivitetyt
// Ratkaisu: syynä oli updaten palauttama response.data, joka oli toistettu App.jsx:ssä myös response.data, jommastakummasta
// poistaminen korjasi.
const update = (id, newObject) => {
  console.log(`Ollaan updatessa, urli: ${baseUrl}/${id}`);
  const request = axios.put(`${baseUrl}/${id}`, newObject);
  return request.then((response) => response.data);
};

// ongelma: requestin body url on object object, ei string, sitä ei syötetä oikein?
// ratkaisu: id:tä ei oltu syötetty alakomponentille jossa yksittäisiä henkilöitä renderöitiin
const remove = (id) => {
  console.log(`ollaan removessa, annettu urli: ${baseUrl}/${id}`);
  const request = axios.delete(`${baseUrl}/${id}`);
  return request.then((response) => response.data);
};

export default {
  getAll: getAll,
  create: create,
  update: update,
  remove: remove,
};
