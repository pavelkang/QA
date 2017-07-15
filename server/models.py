from app import db
from datetime import datetime
from sqlalchemy.ext.declarative import declared_attr

# TODO encrypt password

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=True, nullable=False)

    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __repr__(self):
        return '<User %r>' % self.username


    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id).encode('utf-8')

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
        }


class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<Category %r>' % self.name


class ContentMixin(object):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.UnicodeText, nullable=False)
    answer = db.Column(db.UnicodeText, nullable=False)

    @staticmethod
    def parse_answer(a):
        code_separator = '```'
        def create_content(t, c):
            return {
                "type": t,
                "content": c,
            }
        a = a.split('\n')
        answer = []
        idx = 0
        partial_content = ""
        while idx < len(a):
            if a[idx].startswith(code_separator):
                answer.append(create_content("md", partial_content))
                partial_content = ""
                code_end_idx = a[idx+1:].index(code_separator) + idx + 1
                code = "\n".join(a[idx+1: code_end_idx])
                answer.append(create_content("code", code))
                idx = code_end_idx + 1
            else:
                partial_content += a[idx]
                partial_content += "\n"
                idx += 1
        answer.append( create_content("md", partial_content) )
        return answer


    @declared_attr
    def author_id(cls):
        return db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'author_id': self.author_id,
        }

class Draft(db.Model, ContentMixin):
    __tablename__ = 'draft'
    ts_created = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           nullable=False)
    author = db.relationship('User',
                             backref=db.backref('draft', lazy='dynamic'))

    def __init__(self, question, answer, author_id):
        self.question = question
        self.answer = answer
        self.author_id = author_id

    def serialize(self):
        output = ContentMixin.serialize(self)
        output.update({
            'ts_created': self.ts_created,
        })
        return output

class Wiki(db.Model, ContentMixin):
    __tablename__ = 'wiki'
    ts_published = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           nullable=False)
    author = db.relationship('User',
                             backref=db.backref('wiki', lazy='dynamic'))

    def __init__(self, question, answer, author_id):
        self.question = question
        self.answer = answer
        self.author_id = author_id

    def __repr__(self):
        return '<Wiki {}>'.format(self.question)

    def serialize(self, isEditing=False):
        output = ContentMixin.serialize(self)
        if isEditing:
            output['raw_question'] = self.raw_question
            output['raw_answer'] = self.raw_answer
        else:
            output['q'] = self.question
            output['a'] = ContentMixin.parse_answer(self.answer)
        return output
