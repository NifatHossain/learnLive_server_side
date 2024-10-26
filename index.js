const express = require('express')
const app = express()
var cors = require('cors')
const port = 5000

app.use(cors({
    origin:[
        "http://localhost:5173",
    ]
}));


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mtdunhe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const database = client.db("learn-live");
    const usersCollection = database.collection("users");
    // get users from database
    app.get("/getUsers", async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
    });
    //here we will add different API


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('LearnLive server is running...')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})