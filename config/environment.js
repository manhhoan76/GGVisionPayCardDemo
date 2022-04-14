var environments = {
	staging: {
		FIREBASE_API_KEY: "xxx",
		FIREBASE_AUTH_DOMAIN: "xxx",
		FIREBASE_DATABASE_URL: 'xxx',
		FIREBASE_PROJECT_ID: "xxx",
		FIREBASE_STORAGE_BUCKET: "xxx",
		FIREBASE_MESSAGING_SENDER_ID: "xxx",
		GOOGLE_CLOUD_VISION_API_KEY: "xxx"
	},
	production: {
	}
};

function getReleaseChannel() {
	return 'staging';
}
function getEnvironment(env) {
	console.log('Release Channel: ', getReleaseChannel());
	return environments[env];
}
var Environment = getEnvironment(getReleaseChannel());
export default Environment;
