const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors')
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ebhbc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const userCollection = client.db('TaskSphereDB').collection('users')
        const taskCollection = client.db('TaskSphereDB').collection('tasks')

        app.post('/user', async (req, res) => {
            const user = req.body;
            const { email } = user;
            const existingUser = await userCollection.findOne({ email })
            if (existingUser) {
                return res.status(400).send({ message: 'User already exists' });
            }
            const result = await userCollection.insertOne(user)
            res.send(result);
        })

        app.post('/task', async (req, res) => {
            const { title, description, category, email } = req.body;
            const task = {
                title,
                description,
                timestamp: new Date(),
                category,
                email
            };
            const result = await taskCollection.insertOne(task)
            res.send(result)
        })

        app.get('/task', async (req, res) => {
            const { email } = req.query;
            const result = await taskCollection.find({ email }).toArray();
            res.send(result);
        });
        

        app.delete('/task/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })

        app.put('/task/:id', async (req, res) => {
            const id = req.params.id;
            const { title, description } = req.body;

            const query = { _id: new ObjectId(id) };

            const updateDoc = {
                $set: {
                    title,
                    description
                }
            };

            const result = await taskCollection.updateOne(query, updateDoc);
            res.send(result)
        });
        // app.get('/user',async(req,res)=>{
        //     const users = 
        // })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Doing my task")
})

app.listen(port, () => {
    console.log(`task is running on port ${port}`);
})