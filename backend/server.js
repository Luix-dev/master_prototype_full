require('dotenv').config({ path: './variables.env' });
const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');
const routes = require('./routes'); // Import the routes

const app = express();
const port = process.env.PORT || 3000;

// Replace these with your actual Neo4j credentials from environment variables
const uri = "neo4j+s://e299c8fb.databases.neo4j.io";
const user = "neo4j";
const password = "CbDUVZjzebOKX0xBkgPjotoO7Jdvf5qxwKX_SBOsK2c";
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

app.use(cors());
app.use(express.json()); // Middleware to parse JSON

// Use the routes with the driver
app.use('/api', routes(driver));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
