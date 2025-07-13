const mongoose = require('mongoose')

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.j06ov20.mongodb.net/Puhelinluettelo?retryWrites=true&w=majority&appName=Cluster0`

const userSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const User = mongoose.model('User', userSchema)

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
} else if (process.argv.length === 3) {
  mongoose.set('strictQuery', false)
  mongoose.connect(url)
  console.log('Phonebook:')
  User.find({}).then((result) => {
    result.forEach((user) => {
      console.log(`${user.name} ${user.number}`)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]
  console.log('adding new user...')
  mongoose.set('strictQuery', false)
  mongoose.connect(url)
  const user = new User({
    name: name,
    number: number,
  })
  user.save().then((result) => {
    console.log(`Added ${user.name} number ${user.number} to phonebook`)
    mongoose.connection.close()
  })
}
