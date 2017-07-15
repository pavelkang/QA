import os
basedir = os.path.abspath(os.path.dirname(__file__))

dburl = "postgresql://localhost/mywiki_dev"

class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    SECRET_KEY = 'some-secrets'
    SQLALCHEMY_DATABASE_URI = dburl #os.environ['DATABASE_URL']

class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
