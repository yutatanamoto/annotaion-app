# Server

## Usage  
```
$ cd server  
$ pipenv shell  
$ pipenv install  
$ pipenv run python3 main.py  
```
## Rebuild react-app and restart flask server
```
$ cd client && npm run build && cp -r build ../server && cd ../server && pipenv shell  
$ pipenv run python3 main.py  
```