import { useState, useEffect } from 'react';
import personService from './services/persons';

// Filter -komponentti ----------------------
const Filter = ({ value, change }) => {
  return (
    <div>
      filter shown with: <input value={value} onChange={change} />
    </div>
  );
};

// Käyttäjän inputin komponentti ----------------------
const NewInput = ({
  submit,
  namevalue,
  numbervalue,
  namehandler,
  numberhandler,
}) => {
  return (
    <form onSubmit={submit}>
      <div>
        name: <input value={namevalue} onChange={namehandler} />
      </div>
      <div>
        number: <input value={numbervalue} onChange={numberhandler}></input>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

// Yhden käyttäjän renderöinti ----------------------
const RenderOne = ({ person, remove }) => {
  return (
    <div>
      <p key={person.name}>
        {person.name} {person.number}
      </p>
      <button onClick={remove}>Delete</button>
    </div>
  );
};

// Kaikkien käyttäjien renderöinti ----------------------
const RenderPersons = ({ filtered, remove }) => {
  return (
    <ul>
      {filtered.map((person) => (
        <RenderOne person={person} remove={() => remove(person.id)} />
      ))}
    </ul>
  );
};

// Notifikaatio ----------------------

const Notification = ({ message, type }) => {
  if (message === null) {
    return null;
  }

  return <div className={type}>{message}</div>;
};

// Applikaatio ----------------------
const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');

  // successMessage välittää kaikkien notifikaatioiden sisällön, ei vain onnistuneiden
  const [successMessage, setSuccessMessage] = useState(null);

  // colorSchemeType välittää Notification -moduulille tiedon div:in className:n sisällön,
  // joka määrittää miten se on tyylitelty CSS -tiedostossa, tällöin tyylin voi muuttaa
  // notifikaation tyyppiin sopivaksi (success => green, fail => red)
  const [colorSchemeType, setColorSchemeType] = useState(null);

  // Kaikkien henkilöiden haku
  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  // Henkilön poisto

  const handleRemove = (id) => {
    // Haetaan poistettava henkilö, jotta saadaan nimi poisto ja error viestiin
    const removedPerson = persons.filter((person) => person.id === id);

    if (
      window.confirm(`Do you want to remove person ${removedPerson[0].name}?`)
    ) {
      personService
        .remove(id)
        .then(() => {
          console.log(`person ${id} removed`);
        })
        .catch(() => {
          alert(`'${removedPerson[0].name}' was already deleted from server`);
        });

      // Henkilölistan päivittäminen
      const updatedPersons = persons.filter((person) => person.id != id);
      setPersons(updatedPersons);
      setColorSchemeType('success');
      setSuccessMessage(`Removed ${removedPerson[0].name}`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };

  // Nimen & numeron lisäys -------------------
  const addName = (event) => {
    event.preventDefault();
    const nameObject = {
      name: newName,
      number: newNumber,
    };
    // Jos samanniminen henkilö löytyy jo listasta, kysytään halutaanko numeroa päivittää
    const duplicates = persons.filter((person) => person.name === newName);
    if (duplicates.length != 0) {
      const matchedPerson = persons.find((person) => person.name === newName);
      console.log(matchedPerson);
      if (
        window.confirm(
          `${newName} is already added to the notebook, replace the old number with a new one?`
        )
      ) {
        personService
          .update(matchedPerson.id, nameObject)
          .then((response) => {
            setPersons(
              persons.map((person) =>
                person.id !== matchedPerson.id ? person : response
              )
            );
          })
          .catch(() => {
            alert(`'${nameObject.name}' was already deleted from server`);
          });
        setNewName('');
        setNewNumber('');
        setColorSchemeType('success');
        setSuccessMessage(`Updated ${nameObject.name}`);
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        return;
      }
      // Muuten lisätään uusi henkilö
    } else {
      personService
        .create(nameObject)
        .then(() => {
          setPersons(persons.concat(nameObject));
        })
        .catch((error) => {
          console.log(error.response.data.error);
          setColorSchemeType('fail');
          setSuccessMessage(`${error.response.data.error}`);
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        });
      setNewName('');
      setNewNumber('');
      setColorSchemeType('success');
      setSuccessMessage(`Added ${nameObject.name}`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };

  // Event handlerit -------------------
  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // boolean jolla filtteröidään nimien listasta filtteriä vastaavat nimet
  const namesToShow = filter
    ? persons.filter((person) => person.name.toLowerCase().includes(filter))
    : persons;

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification
        message={successMessage}
        type={colorSchemeType}
      ></Notification>
      <Filter value={filter} change={handleFilterChange} />
      <h2>Add new</h2>
      <NewInput
        submit={addName}
        namevalue={newName}
        numbervalue={newNumber}
        namehandler={handleNameChange}
        numberhandler={handleNumberChange}
      />
      <h2>Numbers</h2>
      <RenderPersons filtered={namesToShow} remove={handleRemove} />
    </div>
  );
};

export default App;
