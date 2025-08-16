import { ProgressiveJSON } from "./progressive-json.ts";

const mockDataResp = [
	'{ "username": "darklord", "email": "darklord@hell.com", "pii": "$1", "conditions": "$3" }',
	'/* $1 */\n{ "age": 20, "address": "$2", "symptoms": "$3" }',
	'/* $2 */\n{ "street": "a", "pincode": "111111" }',
	'/* $3 */\n[ {"symptom": "some symptom"} ]',
];

const mockDataListResp = [
	'[ { "conditions": "$1", "remedies" :"$2" } ]',
	'/* $1 */\n[{"condition": "condition a"}]',
	'/* $2 */\n[{"remedies": "remedy a"}]',
];

function main() {
	const progressiveJson = new ProgressiveJSON();
	for (const data of mockDataResp) {
		progressiveJson.parseStr(data);
	}

	console.log(progressiveJson.getResult());

	const progressiveJson2 = new ProgressiveJSON();
	for (const data of mockDataListResp) {
		progressiveJson2.parseStr(data);
	}

	console.log(JSON.stringify(progressiveJson2.getResult()));
}

main();
