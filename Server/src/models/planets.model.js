const { rejects } = require('assert');
const {parse}  = require('csv-parse');
const fs = require('fs');
const path = require('path');

// const planets = require('./planets.mongo')
const planets =  require('./planets.mongo');


const habitablePlanets = [];

function isHabitable(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
  && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
  && planet['koi_prad'] < 1.6;
}

/*

*/

function loadPlanetsData(){
  return new Promise((resolve, reject)=>{
    fs.createReadStream(path.join(__dirname, '..', '..','data','kepler_data.csv' ))
    .pipe(parse({
      comment: '#',
      columns: true,
    }))
    .on('data', async (data) => {
      if(isHabitable(data))
      // habitablePlanets.push(data)
      savePlanet(data)
      
    })
    .on('error', (err)=>{
      console.log(err)
      reject(err)
    })
    .on('end',()=>{
      habitablePlanets.map((planet)=>{
        return planet['kepler_name'];
      }) ;
      // console.log(`${habitablePlanets.length} habitable planets found!` );
      // console.log('done');
      resolve();
    });
  })
}



async function savePlanet(planet) {
  try {
    await planets.updateOne({
    keplerName: planet.kepler_name
    },{
      keplerName: planet.kepler_name
    },{
      upsert: true
    });
  } catch (err) {
    console.error(`Could not save planets ${err}`)
  }
  
}

async function getAllPlanets() {
  return await planets
  .find({});
  
}

// parse()

module.exports = {
  loadPlanetsData,
  getAllPlanets,
}