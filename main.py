import os

from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/ads-library-data')
def api_ads_library():
  return jsonify([{'a':1}])

if __name__ == '__main__':
    app.run(port=int(os.getenv('PORT', 5000)))
pip