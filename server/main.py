import os
import glob
from flask import Flask, render_template, jsonify

image_dir = 'build/static/image'
image_ext = '.jpg'
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
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=5000)
