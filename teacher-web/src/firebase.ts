import {FirebaseApp,initializeApp} from "firebase/app";
import {Auth,getAuth,signInWithEmailAndPassword} from "firebase/auth";

const config={apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,messagingSenderId:import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID};
export const firebaseConfigured=Boolean(config.apiKey&&config.authDomain&&config.projectId&&config.appId);
let app:FirebaseApp|undefined;let auth:Auth|undefined;
function firebaseAuth(){if(!firebaseConfigured)throw new Error("Firebase is not configured for this teacher web deployment");if(!app)app=initializeApp(config);if(!auth)auth=getAuth(app);return auth;}
export async function signInTeacher(email:string,password:string){const credential=await signInWithEmailAndPassword(firebaseAuth(),email,password);return credential.user.getIdToken();}
