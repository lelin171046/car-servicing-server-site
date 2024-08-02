const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_pass}@cluster0.0f5vnoo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// let servicesCollection;

async function run() {
  try {
    await client.connect();
    const servicesCollection = client.db('carDoctor').collection('services');
    const bookingsCollection = client.db('carDoctor').collection('bookings');
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');


    app.get('/services', async (req, res) => {
  
        const result = await servicesCollection.find().toArray();
        res.send(result);
     
    });
    //delete booking
    app.delete('/bookings/:id', async (req, res)=>{
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)};
      const result = await bookingsCollection.deleteOne(query);
      res.send(result)
      
      
    })
    //update & confirm booking
    app.patch('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateBooking = req.body;
      console.log(updateBooking);
      const updateDoc = {
        $set: {
          status: updateBooking.status
        }
      };
      const result =  await bookingsCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
    //my services
    app.get('/bookings', async(req, res)=>{
        console.log(req.query.email);
        let query = {};
        if(req.query?.email){
            query = { email: req.query.email}
        }
        const result = await bookingsCollection.find(query).toArray();
        res.send(result)
    })

///getting services info
    app.get('/services/:id', async(req, res)=>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id)}
        const options = {
          projection: { title: 1, price: 1, img:1, service_id:1}
        };
        // const result = await servicesCollection.findOne(query, Option).toArray();
        const result = await servicesCollection.findOne(query, options )
        res.send(result)
    });
    //booking
    app.post('/booking', async(req, res)=>{
        const booking =req.body;
        console.log(booking);
        const result = await bookingsCollection.insertOne(booking);
        res.send(result)
    })
    // Start the server after the database connection is established
    app.listen(port, () => {
      console.log(`Site running on port: ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Your site is running');
});
