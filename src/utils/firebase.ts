// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
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
const revenue = collection(db, 'revenue')

export async function createRevenue(revenueData: {
  amount: number
  date: Date
  type: 'credits' | 'pump' | 'mint'
}) {
  try {
    const docRef = await addDoc(revenue, revenueData)
    console.log('Revenue created with ID: ', docRef.id)
  } catch (error) {
    console.error('Error creating revenue: ', error)
  }
}

// Create a new user
export async function createUser(userData: UserDB) {
  try {
    const docRef = await addDoc(usersCollectionRef, userData)
    console.log('User created with ID: ', docRef.id)
    return await getUserByWalletAddress(userData.walletAddress)
  } catch (error) {
    console.error('Error creating user: ', error)
    throw error
  }
}

// Read all users
async function readUsers() {
  try {
    const querySnapshot = await getDocs(usersCollectionRef)
    querySnapshot.forEach((doc) => {
      console.log('User data: ', doc.id, ' => ', doc.data())
    })
  } catch (error) {
    console.error('Error reading users: ', error)
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

// Delete a user
async function deleteUser(userId: string) {
  try {
    const userDocRef = doc(db, 'users', userId)
    await deleteDoc(userDocRef)
    console.log('User deleted with ID: ', userId)
  } catch (error) {
    console.error('Error deleting user: ', error)
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
