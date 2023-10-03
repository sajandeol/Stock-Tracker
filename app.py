import yfinance as yf
import plotly.express as px
import plotly as plotly
import json
from flask import Flask, jsonify, request, render_template, redirect, url_for
import pandas as pd

json_data = None

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/quote', methods=['GET', 'POST'])
def quote():
    return render_template('quote.html')


@app.route('/callStock', methods=['GET', 'POST'])
def callStock():
  
    #FOR YFINANCE API
    # .TO for TSE, .NE for New York, and nothing for Nasdaq
    #Get users ticker input
    output = request.get_json()
    # this converts the json output to a python dictionary
    json_symbol = json.loads(output)
    symbol = str(json_symbol['combined'])

    stock = yf.Ticker(symbol)
    name = symbol
# get all stock info (slow) -- NOT WORKING ANYMORE
    # info = stock.info
# fast access to subset of stock info (opportunistic)
    info = ""
    previousClose = None
    news = None
    dividends = None
    marketCap = None
    exchange = None
    dayHigh = None
    dayLow = None
    open = None
    lastPrice = None

    #if failed continue to next one
    try:
        info = stock.fast_info
    except:
        print("Cannot get fast_info")
    
    try:
         previousClose = info['previousClose']
    except:
        print("Cannot Decrypt Previous Close")
    try:
         news = stock.news
    except:
        print("Cannot Decrypt news")
    try:
         dividends = stock.dividends
    except:
        print("Cannot Decrypt dividends")
    try:
         marketCap = info['marketCap']
    except:
        print("Cannot Decrypt marketCap")
    try:
        exchange = info['exchange']
    except:
        print("Cannot Decrypt Exchange")
    try:
         dayHigh = info['dayHigh']
         dayLow = info['dayLow']
    except:
        print("Cannot Decrypt dayLow/High")
    try:
         open = info['open']
         lastPrice = info['lastPrice']
    except:
        print("Cannot Decrypt open/lastPrice")
    try:
         volume = info['lastVolume']
    except:
        print("Cannot Decrypt volume")
    

# get historical market data
    hist = stock.history(period='max', interval='1wk')
# Calculate dayChange
    dayChange = ((lastPrice-previousClose) / previousClose)*100


# #First Version of Price History Chart
    old = hist.reset_index()
    fig = px.line(old, x="Date", y="Open", title="{} Price History Chart".format(name))

    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    
    json_data = json.dumps(
        {
        'symbol': symbol,
        'lastPrice': lastPrice,
        'previousClose': previousClose,
        'open': open,
        'dayHigh': dayHigh,
        'dayLow': dayLow,
        'marketCap': marketCap,
        'exchange': exchange,
        'graphJSON':graphJSON,
        'dayChange': dayChange,
        'volume': volume,
        # 'dividends' : ser,
        'news': news
         })

    return json_data

if __name__ == "__main__":
    app.run()
