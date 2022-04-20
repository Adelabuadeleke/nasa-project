const mongoose = require('mongoose');

const MONGO_DEV = process.env.MONGO_DEV

mongoose.connection.once('open', ()=>{
  console.log('MongoDB Connection ready!')
})

mongoose.connection.on('error', (err)=>{
  console.error(err)
})

async function mongoConnect() {
  await mongoose.connect(MONGO_DEV, {
    useNewUrlParser: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
    useUnifiedTopology: true,
  })
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect
}