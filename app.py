from flask import Flask, render_template, make_response, request
from flask_cors import CORS
import urllib.request
import json
import platform

# used for camera upload to Google Drive
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import pydrive.settings

# set up pydrive
pydrive.settings.LoadSettingsFile(filename='settings.yaml')
gauth = GoogleAuth()
# Create local webserver and auto handles authentication.
gauth.LocalWebserverAuth('127.0.0.1', [5000])
drive = GoogleDrive(gauth)

if platform.system() == 'Linux':
    from DHT_test import dht_reading


app = Flask(__name__)
CORS(app)


@app.route('/')
def index():
    resp = make_response(render_template('index.html', dark="dark-mode"))
    resp.set_cookie('PreferredMode', 'dark-mode')
    request.cookies.get('PreferredMode')
    return resp


@app.route('/satellites')
def satellites():
    return render_template('satellites.html')


@app.route('/spaceship')
def spaceship():
    return render_template('spaceship.html')


@app.route('/device')
def device():
    return render_template('device.html')


@app.route('/readings')
def readings():
    if platform.system() == 'Linux':
        data = dht_reading()
    else:
        data = {'temp': 82,
                'humidity': 56}
    return json.dumps(data)


@app.route('/camera')
def camera():
    return render_template('camera2.html')


@app.route('/upload', methods=['POST'])
def upload():

    # get jpeg url from page
    file = request.get_json()

    # https://stackoverflow.com/questions/19395649/python-pil-create-and-save-image-from-data-uri
    response = urllib.request.urlopen(file['value'])
    with open('image.jpeg', 'wb') as fd:
        fd.write(response.file.read())

    # upload to Goodle Drive
    gfile = drive.CreateFile({'parents': [{'id': '10LEU7TFZSfC7Zo8GNWmUPBeOqkA8_4G2'}]})
    gfile.SetContentFile('ufo.jpeg')
    gfile.Upload()
    return render_template('camera2.html')


if __name__ == '__main__':
    app.secret_key = 'super secret key'
    app.config['SESSION_TYPE'] = 'filesystem'
    app.run(host="localhost", port=5000, debug=True)
