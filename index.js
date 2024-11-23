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


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const courseCollection = database.collection('Courses')
    const courseContentCollection = database.collection('courseContent')
    // get users from database
    app.get("/getUsers", async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
    });
    app.get("/getAllCourses", async (req, res) => {
        const result = await courseCollection.find().toArray();
        res.send(result);
    });
    app.get("/getCourseDetails/:id", async (req, res) => {
        const newId= req.params.id;
        const query = { _id: new ObjectId(newId)}
        const result = await courseCollection.findOne(query)
        res.send(result);
    });
    app.get("/getCourseContents/:id", async (req, res) => {
        const newId= req.params.id;
        const query = { courseId: newId}
        const result = await courseContentCollection.findOne(query)
        res.send(result);
    });
    app.post('/addCourseContent/:id', async (req, res) => {
      const { lectures } = req.body;
      const courseId = req.params.id; // `courseId` where lectures will be added
    
      try {
        // Check and update or insert new course content
        const course = await courseContentCollection.findOneAndUpdate(
          { courseId }, // Find the document with the matching `courseId`
          { $push: { lectures: { $each: lectures } } }, // Append new lectures to the `lectures` array
          { new: true, upsert: true } // Create a new document if not found and return the updated document
        );
    
        res.status(201).json({
          message: "Content added successfully",
          course,
        });
      } catch (error) {
        console.error("Error saving course content:", error);
        res.status(500).json({ message: "Error saving course content", error });
      }
    });
    app.post('/createQuiz/:id', async (req, res) => {
      const { id } = req.params; // Fix the parameter destructuring
      const { quizName, quizQuestions } = req.body;
    
      const newQuiz = {
        quizName,
        quizQuestions,
      };
    
      try {
        const course = await courseContentCollection.findOneAndUpdate(
          { courseId: id }, // Match the document by courseId
          { $push: { quizes: newQuiz } }, // Directly push the object
          { new: true, upsert: true } // Return the updated document and create it if not found
        );
    
        res.status(201).json({
          message: "Quiz added successfully",
          course,
        });
      } catch (error) {
        console.error("Error saving Quiz:", error);
        res.status(500).json({ message: "Error saving Quiz", error });
      }
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
  app.post('/addCourse',async(req,res)=>{
    const result = await courseCollection.insertOne(req.body);
    res.send(result);
  })
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