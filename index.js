const express = require('express')
const app = express()
var cors = require('cors')
const port = 5000
app.use(express.json());
require('dotenv').config();

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
    // Use this function to calculate Euclidean distance between two descriptors
  function calculateDistance(descriptor1, descriptor2) {
    return Math.sqrt(descriptor1.reduce((acc, val, i) => acc + Math.pow(val - descriptor2[i], 2), 0));
  }

  app.post('/addUser', async (req, res) => {
    const person = req.body;
    const { email, descriptor } = person;

    // Check if email already exists
    const emailQuery = { email: email };
    const existingUser = await usersCollection.findOne(emailQuery);
    if (existingUser) {
        return res.send({ message: 'User already exists', insertedId: null });
    }

    // Check if face descriptor matches any existing descriptors
    const tolerance = 0.6; // Adjust this as needed
    const allUsers = await usersCollection.find().toArray();

    const isDuplicate = allUsers.some(user => {
        if (user.descriptor) {
            const distance = calculateDistance(user.descriptor, descriptor);
            return distance < tolerance;
        }
        return false;
    });

    if (isDuplicate) {
        return res.send({ message: 'You are previously registered', insertedId: null });
    }

    // Save new user if no duplicate found
    const result = await usersCollection.insertOne(person);
    res.send(result);
  });

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