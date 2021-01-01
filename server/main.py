import os
import glob
import json
import base64
from io import BytesIO
from PIL import Image
from flask import Flask, render_template, jsonify, request

image_dir = 'build/static/image'
image_ext = '.jpg'
result_dir = './results'
mask_image_dir = './results/masks'
log_dir = './results/logs'
app = Flask(__name__, static_folder="./build/static", template_folder="./build")

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/api/samples')
def get_sample_names():
    image_path_list = glob.glob(image_dir+'/*'+image_ext)
    sample_names = [os.path.splitext(os.path.basename(path))[0] for path in image_path_list]
    response = {'sampleNames': sample_names, 'annotatedSampleNames': []}
    print(response)
    return jsonify(response), 200

@app.route('/api/save', methods=["POST"])
def save():
    request_json = request.json
    sample_name = request_json['sample_name']
    participant_name = request_json['participant_name']
    base64_image = request_json['image'].split(',')[1]
    code = base64.b64decode(base64_image)
    image = Image.open(BytesIO(code))
    save_dir = "{}/{}".format(result_dir, participant_name)
    mask_image_save_dir = "{}/contour_images".format(save_dir)
    print(mask_image_save_dir)
    edit_log_save_dir = "{}/edit_logs".format(save_dir)
    if not os.path.isdir(save_dir):
        os.mkdir(save_dir)
    if not os.path.isdir(mask_image_save_dir):
        os.mkdir(mask_image_save_dir)
    if not os.path.isdir(edit_log_save_dir):
        os.mkdir(edit_log_save_dir)
    image_save_path = '{}/{}.png'.format(mask_image_save_dir, sample_name)
    image.save(image_save_path)
    json_save_path = '{}/{}.json'.format(edit_log_save_dir, sample_name)
    mode = request.args.get('mode')
    if mode == 'write' or mode is None:
        edit_logs = request_json['edit_logs']
    elif mode == 'add':
        if os.path.isfile(json_save_path):
            with open(json_save_path, 'r') as f:
                edit_logs = json.load(f)
            edit_logs.extend(request_json['editLogs'])
        else:
            edit_logs = request_json['editLogs']
    with open(json_save_path, 'w') as f:
        json.dump(edit_logs, f, indent=4)
    return jsonify({"message": "OK"}), 200

@app.route('/api/logging', methods=["POST"])
def logging():
    request_json = request.json
    participant_name = request_json['participant_name']
    save_dir = "{}/{}".format(result_dir, participant_name)
    if not os.path.isdir(save_dir):
        os.mkdir(save_dir)
    json_save_path = '{}/experiment_log.json'.format(save_dir)
    if os.path.isfile(json_save_path):
        with open(json_save_path, 'r') as f:
            logs = json.load(f)
        logs.append(request_json['log'])
    else:
        logs = [request_json['log']]
    with open(json_save_path, 'w') as f:
        json.dump(logs, f, indent=4)
    return jsonify({"message": "OK"}), 200

@app.route('/api/questionnaire', methods=["POST"])
def save_answer():
    type_ = request.args.get('type')
    request_json = request.json
    participant_name = request_json['participant_name']
    save_dir = "{}/{}".format(result_dir, participant_name)
    if not os.path.isdir(save_dir):
        os.mkdir(save_dir)
    json_save_path = '{}/{}_questionnaire.json'.format(save_dir, type_)
    answers = [request_json['answers']]
    with open(json_save_path, 'w') as f:
        json.dump(answers, f, indent=4)
    return jsonify({"message": "OK"}), 200

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=5000)
