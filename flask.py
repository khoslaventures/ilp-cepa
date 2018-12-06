from flask import Flask
from flask import request
import urlparse
import json


app = Flask(__name__)

#Volatile! Data gets flushed whenever server restarts. 
addr_to_key = {}

@app.route('/')
def hello_world():
    return 'Hello from Flask!'

@app.route('/publish', methods = ['POST', 'PUT'])
def publish_node_data():
    data = request.json
    addr, pubkey = data['addr'], data['pubkey']
    global addr_to_key
    addr_to_key[addr] = pubkey
    return 'OK'

@app.route('/clear_data', methods = ['GET'])
def clear_data():
    global addr_to_key
    addr_to_key = {}
    return 'okay'

@app.route('/get_addresses', methods = ['GET'])
def get_addresses():
    return json.dumps(addr_to_key)