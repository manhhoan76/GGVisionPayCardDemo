import Environment from './environment';
import * as firebase from 'firebase/compat';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

firebase.initializeApp({
	apiKey: Environment['FIREBASE_API_KEY'],
	authDomain: Environment['FIREBASE_AUTH_DOMAIN'],
	databaseURL: Environment['FIREBASE_DATABASE_URL'],
	projectId: Environment['FIREBASE_PROJECT_ID'],
	storageBucket: Environment['FIREBASE_STORAGE_BUCKET'],
	messagingSenderId: Environment['FIREBASE_MESSAGING_SENDER_ID']
});

// const db = firebase.firestore();
// firebase.default().storage().ref();
// db.settings({timestampsInSnapshots:true});

export default firebase;
