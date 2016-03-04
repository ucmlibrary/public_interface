# install public interface

To work on this project as a developer, you will actually need to
get python, node, and ruby environments on your development host.

## Requirements to build

 * node http://nodejs.org and node's package manager https://npmjs.org
 * requires ruby environment where `gem install sass` has been run
 * requires python environment with `pip` or `virualenv` set up

## What is happening here?

The root directory of this repository is both the root of a [django applicaiton](https://www.djangoproject.com) and a [Yeoman](http://yeoman.io) scaffold [`yo webapp`](https://github.com/yeoman/generator-webapp#readme) created back when `grunt` was the default task runner.

## configuration 

http://12factor.net/config

see `env.conf.in` as a tempalte file for setting environmental variables during development.  `env.conf` is listed in `.gitignore` -- so if you use that filename for your local conf, it won't get checked into git.  Before you start the server, you will need to
```
. env.conf
```

## install python / django

python installation left as an exercise to the reader

```
# sudo easy_install virtualenv
virtualenv-2.7 py27
. py27/bin/activate
pip install -r requirements.txt
python manage.py migrate
```

and run the test server

```
python manage.py runserver
```

it should be running on http://localhost:8000

## install npm / grunt

if you need to work on the [HTML/CSS/JS](https://github.com/ucldc/public_interface/blob/master/app/ReadMe.md) then you will want to run grunt to assemble these components.

```
brew install npm
npm install -g bower
npm install
bower install
```

```
grunt serve
```

# Windows Install

[note, use case for window's users is for QA of candiate producton indexes, not code hacking]

http://conda.pydata.org/miniconda.html  <-- python 2.7

http://git-scm.com/download/win

save `run.bat`

### initial setup
only do this once
```dos
conda create -n myenv python
activate myenv
git clone https://github.com/ucldc/public_interface.git
cd public_interface
pip install -r requirements.txt
```
edit `run.bat` in notepad, as per below
```
run.bat
```

### run again

```dos
activate myenv
cd public_interface
```
if you need to update the code


```
git pull origin master
```
run the local server
```
run.bat
```

## `run.bat`:
```bat
set UCLDC_THUMBNAIL_URL=...
set UCLDC_STATIC_URL=...
set UCLDC_SOLR_URL=...
set UCLDC_SOLR_API_KEY=...
set UCLDC_DEBUG=1
set UCLDC_IMAGES=...
set UCLDC_MEDIA=...
set UCLDC_IIIF=...
python manage.py runserver
```
