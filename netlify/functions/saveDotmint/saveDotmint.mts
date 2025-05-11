import { Context } from '@netlify/functions';
import { MongoClient, ObjectId, Db } from 'mongodb';

// Define the DotMint type
type DotMint = { color: string; position: [number, number] }[];

// MongoDB connection setup
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('dotmint');
  cachedDb = db;
  return db;
}

// Check if a dotmint already exists in the database
async function dotmintExists(db, dotmint: DotMint) {
  const collection = db.collection('dotmints');
  
  // We need to match all colors and positions exactly
  // First, ensure the same number of dots
  const count = await collection.countDocuments({
    $expr: { $eq: [{ $size: "$dots" }, dotmint.length] }
  });
  
  if (count === 0) return false;
  
  // Then look for exact matches by comparing each dot
  // This is a bit complex because we need to match array elements exactly
  const query = {
    $expr: { $eq: [{ $size: "$dots" }, dotmint.length] }
  };
  
  // For each dot in the input, verify it exists in the database
  const potentialMatches = await collection.find(query).toArray();
  
  // Compare each potential match dot by dot
  for (const match of potentialMatches) {
    // Sort both arrays to make comparison consistent
    const sortedInput = [...dotmint].sort((a, b) => {
      // First sort by position[0], then position[1], then color
      if (a.position[0] !== b.position[0]) return a.position[0] - b.position[0];
      if (a.position[1] !== b.position[1]) return a.position[1] - b.position[1];
      return a.color.localeCompare(b.color);
    });
    
    const sortedStored = [...match.dots].sort((a, b) => {
      if (a.position[0] !== b.position[0]) return a.position[0] - b.position[0];
      if (a.position[1] !== b.position[1]) return a.position[1] - b.position[1];
      return a.color.localeCompare(b.color);
    });
    
    // Compare all dots
    let isMatch = true;
    for (let i = 0; i < sortedInput.length; i++) {
      const inputDot = sortedInput[i];
      const storedDot = sortedStored[i];
      
      if (
        inputDot.color !== storedDot.color ||
        inputDot.position[0] !== storedDot.position[0] ||
        inputDot.position[1] !== storedDot.position[1]
      ) {
        isMatch = false;
        break;
      }
    }
    
    if (isMatch) return true;
  }
  
  return false;
}

export default async (request: Request, context: Context) => {
  try {
    // Connect to the database
    const db = await connectToDatabase();
    const collection = db.collection('dotmints');
    
    // Handle different HTTP methods
    if (request.method === 'POST') {
      // Handle POST request to save a new dotmint
      const requestBody = await request.json();
      
      // Validate the input
      if (!Array.isArray(requestBody)) {
        return new Response(JSON.stringify({ error: 'Invalid dotmint format. Expected an array.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Validate each dot in the dotmint
      const dotmint = requestBody as DotMint;
      for (const dot of dotmint) {
        if (!dot.color || !Array.isArray(dot.position) || dot.position.length !== 2) {
          return new Response(JSON.stringify({ 
            error: 'Invalid dot format. Expected {color: string, position: [number, number]}.' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Check if dotmint already exists
      const exists = await dotmintExists(db, dotmint);
      if (exists) {
        return new Response(JSON.stringify({ 
          error: 'Dotmint already exists',
          success: false
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Save the dotmint
      const result = await collection.insertOne({ 
        dots: dotmint,
        createdAt: new Date()
      });
      
      return new Response(JSON.stringify({ 
        id: result.insertedId.toString(),
        success: true
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } 
    else if (request.method === 'GET') {
      // Handle GET request to retrieve a dotmint by id
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      
      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      try {
        const result = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!result) {
          return new Response(JSON.stringify({ error: 'Dotmint not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify({
          id: result._id.toString(),
          dots: result.dots,
          createdAt: result.createdAt
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid ObjectId format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    else {
      // Handle unsupported methods
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}