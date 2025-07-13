// Moduuli mongoose -koodille jossa on yhteys mongodb -kantaan ja schema jolla määritellään minkätyyppistä tieto on

const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

// Haetaan url .env tiedostosta
const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose
  .connect(url)

  .then((result) => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const userSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, required: true },
  number: {
    type: String,
    minlength: 8,
    validate: {
      validator: function (v) {
        // \d = digit
        return /\d{2,3}-\d{5,8}/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('User', userSchema)
