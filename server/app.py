import jinja2
import os
import leancloud
from flask import Flask
from flask import render_template, request, jsonify

ROOT_DIR = '/Users/kai/myWiki'
STATIC_DIR = '{}/client/build'.format(ROOT_DIR)
TEMPLATE_DIR = '{}/client/build'.format(ROOT_DIR)

#STATIC_DIR = '/client/build'
#TEMPLATE_DIR = STATIC_DIR

app = Flask(__name__,
            static_url_path='',
            static_folder=STATIC_DIR,
            template_folder=TEMPLATE_DIR)

template_dirs = jinja2.ChoiceLoader([
    app.jinja_loader,
    jinja2.FileSystemLoader([
        os.path.abspath(TEMPLATE_DIR),
    ])
])

app.jinja_loader = template_dirs
app.config['SECRET_KEY'] = '1209'
#app.config['SESSION_TYPE'] = 'filesystem'
app.debug = True

@app.route("/")
def home():
    print os.getcwd()
    return app.send_static_file('index.html')

app.run()
