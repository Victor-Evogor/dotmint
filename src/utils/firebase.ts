// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}
import {UserDB} from "@/types"
// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)



// Function to handle CRUD operations on the 'users' collection
const usersCollectionRef = collection(db, 'users')

// Create a new user
export async function createUser(userData: Pick<UserDB, 'walletAddress' | 'credits'>) {
  try {
    const docRef = await addDoc(usersCollectionRef, userData)
    console.log('User created with ID: ', docRef.id)
    return await getUserByWalletAddress(userData.walletAddress)
  } catch (error) {
    console.error('Error creating user: ', error)
    throw error
  }
}

// Update a user
export async function updateUser(userId: string, updatedData: Partial<UserDB>) {
  try {
    console.log(userId, updatedData)

    const userDocRef = doc(db, 'users', userId)
    await updateDoc(userDocRef, updatedData)
    console.log('User updated with ID: ', userId)
  } catch (error) {
    console.error('Error updating user: ', error)
  }
}

export async function getUserByWalletAddress(walletAddress: string): Promise<{
  id: string
  credits: number
  walletAddress: string
} | null> {
  const db = getFirestore()
  const usersCollectionRef = collection(db, 'users')

  const q = query(usersCollectionRef, where('walletAddress', '==', walletAddress))

  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return null // User not found
  } else {
    const userDoc = querySnapshot.docs[0]
    return { ...(userDoc.data() as { credits: number; walletAddress: string }), id: userDoc.id } // Return the user data
  }
}
