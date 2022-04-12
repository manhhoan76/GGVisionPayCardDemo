// change the file name dummy.environment.js to "environment.js"
// and add your keys below
// apiKey: ,
//   authDomain: ,
//   projectId: ,
//   storageBucket: ,
//   messagingSenderId: ,
//   appId: "1:213957219611:web:4e937bd96bdd093d662fbe",
//   measurementId: "G-PP2Z4WB12S"

var environments = {
	staging: {
		FIREBASE_API_KEY: "AIzaSyBA5i29hhkw98DiJQy8c_vk4i5P4TYhC88",
		FIREBASE_AUTH_DOMAIN: "ggvisiondemo.firebaseapp.com",
		FIREBASE_DATABASE_URL: 'https://ggvisiondemo-default-rtdb.firebaseio.com/',
		FIREBASE_PROJECT_ID: "ggvisiondemo",
		FIREBASE_STORAGE_BUCKET: "ggvisiondemo.appspot.com",
		FIREBASE_MESSAGING_SENDER_ID: "213957219611",
		GOOGLE_CLOUD_VISION_API_KEY: "AIzaSyBA5i29hhkw98DiJQy8c_vk4i5P4TYhC88"
	},
	production: {
		// Warning: This file still gets included in your native binary and is not a secure way to store secrets if you build for the app stores. Details: https://github.com/expo/expo/issues/83
	}
};

function getReleaseChannel() {
	// let releaseChannel = Expo.Constants.manifest.releaseChannel;
	// if (releaseChannel === undefined) {
	// 	return 'staging';
	// } else if (releaseChannel === 'staging') {
	// 	return 'staging';
	// } else {
	// 	return 'staging';
	// }
	return 'staging';
}
function getEnvironment(env) {
	console.log('Release Channel: ', getReleaseChannel());
	return environments[env];
}
var Environment = getEnvironment(getReleaseChannel());
export default Environment;
