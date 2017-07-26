import jinja2
import os
from flask import Flask, redirect, render_template, request, jsonify, url_for, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_required, login_user, current_user, logout_user

ROOT_DIR = '/Users/kai/myWiki'
STATIC_DIR = '{}/client/build'.format(ROOT_DIR)
TEMPLATE_DIR = '{}/client/build'.format(ROOT_DIR)

# STATIC_DIR = '/client/build'
# TEMPLATE_DIR = STATIC_DIR

app = Flask(__name__,
            static_url_path='',
            static_folder=os.path.abspath(STATIC_DIR),
            template_folder=os.path.abspath(TEMPLATE_DIR))

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


@app.route("/api/log_in", methods=['POST'])
def log_in():
    username = request.args.get('username')
    password = request.args.get('password')
    user = User.query.filter_by(
        username=username,
        password=password,
    ).first()
    print user
    if user is None:
        return jsonify({'error': 'No such user'})
    else:
        login_user(user)
        return redirect(url_for('route_home'))


@app.route("/api/log_out", methods=['GET'])
def log_out():
    logout_user()
    return redirect(url_for('route_login'))

@app.route("/api/add_tag", methods=['POST'])
def add_tag():
    if current_user is None:
        return redirect(url_for('route_register'))
    category = Category(request.json['tag'], current_user.id)
    db.session.add(category)
    db.session.commit()
    return jsonify({})

@app.route("/api/get_tags", methods=['GET'])
def get_tag():
    if current_user is None:
        return redirect(url_for('route_register'))
    tags = map(lambda c: c.serialize(), current_user.categories)
    return jsonify({'tags': tags})

@app.route("/api/add_wiki", methods=['POST'])
def add_wiki():
    if current_user is None:
        return redirect(url_for('route_register'))
    wiki = Wiki(request.json['content']['q'],
                request.json['content']['a'],
                current_user.id)
    for tagId in request.json['content']['tagIds']:
        tag = Category.query.get(tagId)
        if tag is not None:
            wiki.categories.append(tag)
    db.session.add(wiki)
    db.session.commit()
    return jsonify({})

@app.route("/api/save_draft", methods=['POST'])
@login_required
def save_draft():
    if current_user is None:
        return redirect(url_for('route_register'))
    draft = Draft(request.json['q'], request.json['a'], current_user.id)
    db.session.add(draft)
    db.session.commit()
    return jsonify({
        'draft_id': draft.id,
    })

@app.route("/api/update_wiki", methods=['POST'])
@login_required
def update_wiki():
    wiki = Wiki.query.get(request.json['wiki_id'])
    if wiki is None or wiki.author_id != current_user.id:
        return jsonify({'error': 'Not authorized'})
    wiki.question = request.json['content']['q']
    wiki.answer = request.json['content']['a']
    db.session.commit()
    return jsonify({})


@app.route("/api/update_draft", methods=['POST'])
@login_required
def update_draft():
    draft = Draft.query.get(request.json['draft_id'])
    if draft is None or draft.author_id != current_user.id:
        return jsonify({'error': 'Not authorized'})
    draft.question = request.json['content']['q']
    draft.answer = request.json['content']['a']
    db.session.commit()
    return jsonify({})


@app.route("/api/publish_draft", methods=['POST'])
@login_required
def publish_draft():
    wiki = Wiki(request.json['content']['q'],
                request.json['content']['a'],
                current_user.id)
    for tagId in request.json['content']['tagIds']:
        tag = Category.query.get(tagId)
        if tag is not None:
            wiki.categories.append(tag)
    db.session.add(wiki)
    draft = Draft.query.get(request.json['draft_id'])
    db.session.delete(draft)
    db.session.commit()
    return jsonify({})


@app.route("/api/get_editor_data/<int:mode>/<int:obj_id>", methods=['GET'])
@login_required
def get_editor_data(mode, obj_id):
    """
    {
      'content': JSON,
      'tags': []
    }
    """
    tags = map(lambda c: c.serialize(), current_user.categories)
    content = None
    if mode == 1: # editing wiki
        content = Wiki.query.get(obj_id)
    elif mode == 2: # editing draft
        content = Draft.query.get(obj_id)
    return jsonify({
        'tags': tags,
        'content': content.serialize(),
    })

@app.route("/api/get_profile", methods=['GET'])
def get_profile():
    """
    {
      'username':,
      'tags': [{'name':}],
      'drafts': [],
      'numWikis': ,
    }
    """
    if current_user is None:
        return redirect(url_for('route_register'))
    response = {
        'username': current_user.username,
        'tags': map(lambda c: c.serialize(), current_user.categories),
        'drafts': map(lambda d: d.serialize(), current_user.draft),
        'numWikis': current_user.wiki.count(),
    }
    return jsonify(response)

@app.route("/api/delete_wiki/<int:wiki_id>", methods=['POST'])
def delete_wiki(wiki_id):
    wiki_to_delete = Wiki.query.get(wiki_id)
    if wiki_to_delete.author_id == current_user.id:
        db.session.delete(wiki_to_delete)
        db.session.commit()
        return jsonify({})
    else:
        return jsonify({'error': 'Not authorized to delete it.'})


@app.route("/api/delete_draft/<int:draft_id>", methods=['POST'])
def delete_draft(draft_id):
    draft_to_delete = Draft.query.get(draft_id)
    if draft_to_delete.author_id == current_user.id:
        db.session.delete(draft_to_delete)
        db.session.commit()
        return jsonify({})
    else:
        return jsonify({'error': 'Not authorized to delete it.'})


@app.route("/api/preview", methods=['POST'])
def preview():
    content = ContentMixin.parse_answer(request.json['content'])
    return jsonify({
        'content': content,
    })


@app.route("/api/get_wiki", methods=['GET'])
def get_wiki():
    if current_user is None:
        redirect(url_for('route_register'))
    query = request.args.get('q')
    serialized_wikis = map(lambda w: w.serialize(), current_user.wiki)
    if query is None:
        return jsonify(serialized_wikis)
    # Simple Search here
    searchable_texts = [(o['q']+o['raw_a']).lower() for o in serialized_wikis]
    results = []
    for i in xrange(len(searchable_texts)):
        t = searchable_texts[i]
        if query in t.lower():
            results.append(serialized_wikis[i])
    return jsonify(results)


@app.route("/api/register", methods=['POST'])
def register():
    username, password = request.json['username'], request.json['password']
    registered_user = User.query.filter_by(
        username=username).first()
    if registered_user is not None:
        return jsonify({'error': 'Username taken'})
    user = User(username, password)
    db.session.add(user)
    db.session.commit()
    login_user(user)
    if request.args.get('next') is None:
        return redirect(url_for('route_home'))
    else:
        return redirect(request.args.get('next'))


# Routing

@app.route("/editor", defaults={'mode':1, 'obj_id':0})
@app.route("/editor/<int:mode>/<int:obj_id>")
@login_required
def route_editor(mode, obj_id):
    return render_template('index.html')

@app.route("/")
def route_home():
    if not current_user.is_authenticated:
        return redirect(url_for('route_login'))
    return render_template('index.html')

@app.route("/profile")
@login_required
def route_profile():
    if current_user is None:
        return redirect(url_for('route_home'))
    else:
        return render_template('index.html')


@app.route("/login")
def route_login():
    return render_template('index.html')

@app.route("/register")
def route_register():
    return render_template('index.html')

if __name__ == '__main__':
    app.secret_key = "super secret key"
    login_manager.init_app(app)
    app.run()
