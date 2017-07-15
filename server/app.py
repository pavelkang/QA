import jinja2
import os
from flask import Flask, redirect, render_template, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_required, login_user, current_user

ROOT_DIR = '/Users/kai/myWiki'
STATIC_DIR = '{}/client/build'.format(ROOT_DIR)
TEMPLATE_DIR = '{}/client/build'.format(ROOT_DIR)

# STATIC_DIR = '/client/build'
# TEMPLATE_DIR = STATIC_DIR

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
app.debug = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://localhost/mywiki_dev"
db = SQLAlchemy(app)

# Login stuff
login_manager = LoginManager()


from models import *

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    # do stuff
    return "No way"


@app.route("/api/get_topics/<int:user_id>", methods=['GET'])
def get_topics(user_id):
    # TODO
    pass


@app.route("/api/add_topic/<int:user_id>", methods=['GET'])
def add_subtopic(user_id):
    # TODO
    pass


@app.route("/api/add_wiki", methods=['POST'])
def add_wiki():
    if current_user is None:
        return redirect(url_for('route_register'))
    wiki = Wiki(request.json['q'], request.json['a'], current_user.id)
    print wiki
    db.session.add(wiki)
    db.session.commit()
    return jsonify({})

@app.route("/api/save_draft", methods=['POST'])
def save_draft():
    if current_user is None:
        return redirect(url_for('route_register'))
    draft = Draft(request.json['q'], request.json['a'], current_user.id)
    db.session.add(draft)
    db.session.commit()
    return jsonify({})

@app.route("/api/get_profile", methods=['GET'])
def get_profile():
    if current_user is None:
        return redirect(url_for('route_register'))
    print current_user.wiki

@app.route("/api/delete_wiki/<int:user_id>", methods=['POST'])
def delete_wiki():
    # TODO
    pass


@app.route("/api/preview", methods=['POST'])
def preview():
    content = ContentMixin.parse_answer(request.json['content'])
    return jsonify({
        'content': content,
    })

@app.route("/api/get_wiki", methods=['GET'])
def get_wiki():
    wikis = current_user.wiki
    serialized_wikis = map(lambda w: w.serialize(), wikis)
    return jsonify(serialized_wikis)


@app.route("/api/register", methods=['POST'])
def register():
    username, password = request.json['username'], request.json['password']
    registered_user = User.query.filter_by(
        username=username).first()
    if registered_user is not None:
        login_user(registered_user)
        return app.send_static_file('index.html')
    user = User(username, password)
    db.session.add(user)
    db.session.commit()
    login_user(user)
    if request.args.get('next') is None:
        return redirect(url_for('route_home'))
    else:
        return redirect(request.args.get('next'))


# Routing

@app.route("/editor")
@login_required
def route_editor():
    return app.send_static_file('index.html')

@app.route("/")
def route_home():
    return app.send_static_file('index.html')

@app.route("/profile")
def route_profile():
    if current_user is None:
        return redirect(url_for('route_home'))
    else:
        return app.send_static_file('index.html')

@app.route("/register")
def route_register():
    if current_user is not None:
        return redirect(url_for('route_home'))
    else:
        return app.send_static_file('index.html')

if __name__ == '__main__':
    app.secret_key = "super secret key"
    login_manager.init_app(app)
    app.run()
