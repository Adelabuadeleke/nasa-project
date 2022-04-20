const launches =  require('./launches.mongo');
const planets =  require('./planets.mongo');
const axios = require('axios');
const launchesMongo = require('./launches.mongo');

// const launches = new Map();

let DEFAULT_FLIGHT_NUMBER = 100;

// const launch = {
//   flightNumber: 100 , //flight_number
//   mission: 'kepler Exploration X' , //name
//   rocket: 'Explorer X IS1' , //rocket.name
//   launchDate: new Date('December 27, 2030') , //date_local
//   destination: 'Kepler-442 b' ,//not applicable
//   customers: ['ZTM','NASA' ],//payload.customers for each payload
//   upcoming: true,//upcoming
//   success:true,//success
// }

async function populateLaunches() {
  console.log('Downloading lauch Data...')
  const response = await axios.post(SPACEX_API_URL, {
    query:{},
    options:{
      pagination: false,
      populate:[
        {
          path:"rocket",
          select:{
            name: 1
          }
        },
        {
          path:"payloads",
          select:{
            'customer':1
          }
        }
      ]
    }
  });

  if( response.status !== 200) {
    console.log('problem downloading launch data');
    throw new Error('Launch data doenload failed')
  }

  const launchDocs = response.data.docs;

  for(const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload)=>{
      return payload['customers'];
    })

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission:launchDoc['name'],
      rocket:launchDoc['rocket']['name'],
      launchDate:launchDoc['date_local'],
      upcoming:launchDoc['upcoming'],
      success:launchDoc['success'],
      customers
    };
    console.log(`${launch.flightNumber}, ${launch.mission}`)
    await saveLaunch(launch)
  }  
}

// saveLaunch(launch)
// launches.set(launch.flightNumber, launch);
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async  function loadLaunchesData() {
  const firstLauch = await findLaunch({
    flightNumber:1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  })

  if(firstLauch) {
    console.log('Launch data already loaded')
  } else {
    await populateLaunches();
  }
}


async function findLaunch(filter) {
  return await launchesMongo.findOne(filter);
}

async function existsLuanchWithId(launchId) {
  return await launches.findLaunch({ 
    flightNumber: launchId
  })
}

async function getlatestFlightNumber() {
  const latestLaunch = await launches
  .findOne()
  .sort('-flightNumber' );
  if(!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber
}

async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values())
  return await launches
  .find({}, {'_id':0, '__v':0})
  .sort({flightNumber: 1})
  .skip(skip)
  .limit(limit);
}

async function saveLaunch(launch) {
  

  await launches.findOneAndUpdate({
    flightNumber: launch.flightNumber,
  }, launch,{
    upsert:true
  })
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.destination,
  });

  if(!planet) {
    throw new Error('No matching planet found')
  }

const newFlightNumber = await getlatestFlightNumber() + 1

  const newLaunch = Object.assign(launch, {
    success:true,
    upcoming:true,
    customers:['NASA', 'TECHKAM'],
    flightNumber: newFlightNumber
  });

  await saveLaunch(newLaunch);
}


async function abortLaunchById(launchId) {
  const aborted = await launches.updateOne({
    flightNumber:launchId,
  },{
    upcoming: false,
    sucess:false
  })
  console.log(aborted)
  return aborted.ok === 1 && aborted.nModified ===1;
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  scheduleNewLaunch,
  existsLuanchWithId,
  abortLaunchById
}