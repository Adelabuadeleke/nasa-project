const request = require('supertest');
const app = require('../../app');
const {mongoConnect, mongoDisconnect} = require('../../services/mongo')
const {loadPlanetsData} = require('../../models/planets.model')
describe('Launches API', ()=>{
  beforeAll(async()=>{
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async ()=>{
    await mongoDisconnect();
  });
  describe('Test GET /launches', ()=>{
    test('It should respond with 200 sucess', async()=>{
      const response = await request(app)
      .get('/v1/launches')
      .expect('Content-Type', /json/)
      .expect(200)
    })
  }) 
  
  describe('Test POST /launches', ()=>{
    const completelaunchData = {
      mission:'USS Enterprise',
      rocket:'NCC 1701-D',
      destination:'Kepler-62 f',
      launchDate:'January 4, 2028'
    }
  
  const launchDataWithoutDate = {
    mission:'USS Enterprise',
    rocket:'NCC 1701-D',
    destination:'Kepler-62 f',
  }
  
  const launchDataWithInvalidDate = {
    mission:'USS Enterprise',
    rocket:'NCC 1701-D',
    destination:'Kepler-62 f',
    launchDate:'cool'
  }
  
    test('It should respond with 201 sucess', async()=>{
    const response = await request(app)
    .post('/v1/launches')
    .send(completelaunchData)
    .expect('Content-Type', /json/)
    .expect(201)
    const requestDate = new Date(completelaunchData.launchDate).valueOf();
    const responseDate = new Date(response.body.launchDate).valueOf();
    expect(responseDate).toBe(requestDate);
    expect(response.body).toMatchObject(launchDataWithoutDate)
    })
  
    test('It should catch missing requires properties', async()=>{
      const response = await request(app)
      .post('/v1/launches')
      .send(launchDataWithoutDate)
      .expect('Content-Type', /json/)
      .expect(400);
  
    expect(response.body).toStrictEqual({
      error:'Missing required launch property'
    })
    })
  
    test('It should catch invalid  dates', async()=>{
      const response = await request(app)
      .post('/v1/launches')
      .send(launchDataWithInvalidDate)
      .expect('Content-Type', /json/)
      .expect(400);
  
    expect(response.body).toStrictEqual({
      error:'Invalid launch  date'
    })
    })
  }) 

})

