import os
import pandas as pd
from flask import Flask, jsonify
from helpers import *
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/ads-library-data')
def api_ads_library():
  F4 = "ads_library_data.csv"
  DATA_FRAME_ADS_LIBRARY = read_fb_ads_lib_data(file_input = F4)
  
  return j
if __name__ == '__main__':
    app.run(port=int(os.getenv('PORT', 5000)))
pip