import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const APP_SECRET = '19154835ee113766c0167f1bfa6a2061';

admin.initializeApp();

exports.purgeData = functions.https.onRequest(async (req, res) => {
	const original = req.query.text;
	const signed_request = req.body;
	let userId = '';
	try {
		const parsed_request = parse_signed_request(signed_request);
		userId = parsed_request['user_id'];
	} catch {
		res.status(400).send('Bad signature');
		return;
	}
	const writeResult = await admin.firestore().collection('purge-requests').add({ 
		query: original,
		user_id: userId,
	});
	res.json({ 
		url: `https://badboyspodcast.com/purge/${writeResult.id}`, 
		confirmation_code: `Data purge request confirmation code - ${writeResult.id}`,
	});
});

// exports.processPurge = functions.firestore.document('/purge-request/{documentId}')
// 	.onCreate((snap, context) => {
// 		const original = snap.data().original;
// 	});

class ParsedRequest {
	algorithm: string = '';
	expires: number = 0;
	issued_at: number = 0;
	user_id: string = '';
};

function parse_signed_request(signed_request: string): ParsedRequest {
	const [encoded_sig, payload] = signed_request.split(".", 2);

	const secret = APP_SECRET;

	const sig = atob(encoded_sig);
	const data = JSON.parse(atob(payload));

	const expected_sig_base64 = crypto.createHmac('sha256', secret).update(payload).digest('base64');
	const expected_sig = atob(expected_sig_base64);

	if (sig !== expected_sig) {
		throw new Error('Bad signature');
	}

	return data;
}