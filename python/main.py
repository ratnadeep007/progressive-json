import json
from lib import ProgressiveJSON

mock_data_resp = [
    '{ "username": "darklord", "email": "darklord@hell.com", "pii": "$1", "conditions": "$3" }',
    '/* $1 */\n{ "age": 20, "address": "$2", "symptoms": "$3" }',
    '/* $2 */\n{ "street": "a", "pincode": "111111" }',
    '/* $3 */\n[ {"symptom": "some symptom"} ]'
]

mock_data_list_resp = [
    '[ { "conditions": "$1", "remedies" :"$2" } ]',
    '/* $1 */\n[{"condition": "condition a"}]',
    '/* $2 */\n[{"remedies": "remedy a"}]'
]

def main():
    progressive_json = ProgressiveJSON()
    for data in mock_data_resp:
        progressive_json.parse_str(data)

    print(progressive_json.result)

    progressive_json = ProgressiveJSON()
    for data in mock_data_list_resp:
            progressive_json.parse_str(data)

    print(progressive_json.result)



if __name__ == "__main__":
    main()
