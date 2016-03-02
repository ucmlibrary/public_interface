# install public interface

To work on this project as a developer, you will actually need to
get python, node, and ruby environments on your development host.

## Requirements to build

 * node http://nodejs.org and node's package manager https://npmjs.org
 * requires ruby environment where `gem install sass` has been run
 * requires python environment with `pip` or `virtualenv` set up

## install python / django

python installation left as an exercise to the reader

```
# sudo easy_install virtualenv
virtualenv-2.7 py27
. py27/bin/activate
pip install -r requirements.txt
python manage.py
migrate
```

and run the test server

```
python manage.py runserver
```

### Python image server also needed

runs on `http://localhost:8888` see https://github.com/tingletech/md5s3stash

## install npm / grunt

```
brew install npm
npm install -g bower
npm install
bower install
```

```
grunt serve
```

