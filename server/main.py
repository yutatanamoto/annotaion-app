import os
import glob
import json
from io import BytesIO
from PIL import Image
from flask import Flask, render_template, jsonify, request

image_dir = 'build/static/image'
image_ext = '.jpg'
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
    sample_name = request_json['sampleName']
    editor = request_json   ['editor']
    base64_image = request_json['image'].split(',')[1]
    code = base64.b64decode(base64_image)
    image = Image.open(BytesIO(code))
    json_save_path = '{}/{}__{}.json'.format(log_dir, editor, sample_name)
    if os.path.isfile(json_save_path):
        with open(json_save_path, 'r') as f:
            edit_logs = json.load(f)
        edit_logs.extend(request_json['editLogs'])
    else:
        edit_logs = request_json['editLogs']
    with open(json_save_path, 'w') as f:
        json.dump(edit_logs, f, indent=4)
    return jsonify({"message": "OK"}), 200

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=5000)
