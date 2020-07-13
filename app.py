import os
import datetime as dt
import json
import requests

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, render_template, jsonify

from flask_sqlalchemy import SQLAlchemy

######################################
#### SET UP SQLite DATABASE #####
####################################

# This grabs our directory
basedir = os.path.abspath(os.path.dirname(__file__))
# create the application object
app = Flask(__name__)

# Connects our Flask App to our Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
    os.path.join(basedir, 'Resources', 'weather_history.sqlite')
# app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///Resources/weather_history.sqlite"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to our table
Measurement = Base.classes.measurement

# Mapbox api key from .env
API_KEY = os.getenv('API_KEY')
# Google map api key from .env
g_key = os.getenv('g_key')

# use decorators to link the function to a url
@app.route('/')
def home():
    return render_template('index.html', key=API_KEY)  # render a template

# Plotting temperature daily normals 
@app.route("/api/<city>/<startd>/<endd>")
def temp_normals(city, startd, endd):
    '''Return a JSON list of daily normals (the averages for tmin, tmax, and tavg for 
        all historic data matching a specific month and day) for a given city
        and a range between given start and end date. We  calculate trhough last 10 years'''
   
    # Function to calculate daily normals
    def daily_normals(city, date):
        '''Daily Normals.
            Args:
                city (str): A city for which measurements were observed
                date (str): A date string in the format '%m-%d'
            Returns:
                A list of tuples containing the daily normals, tmin, tavg, and tmax
            '''
        sel = [func.min(Measurement.temp), func.round(
            func.avg(Measurement.temp), 1), func.max(Measurement.temp)]
        return db.session.query(*sel).filter(Measurement.location == city).\
            filter(func.strftime("%m-%d", Measurement.date) == date).all()

    # Calculate the daily normals for the trip
    # we will add 1 week before and after scheduled range

    # Convert start and end dates to datetime
    start_dt = dt.datetime.strptime(startd, '%Y-%m-%d').date()
    end_dt = dt.datetime.strptime(endd, '%Y-%m-%d').date()
    # Set the new extended range
    ext = 7
    start_new = start_dt - dt.timedelta(ext)
    end_new = end_dt + dt.timedelta(ext)

    # Use new start and end dates to create an extended range of dates
    ext_dates = [(start_new + dt.timedelta(n))
                for n in range((end_new - start_new).days + 1)]

    # Strip off the year and save a list of %m-%d strings
    extd = [td.strftime("%m-%d") for td in ext_dates]

    # Loop through the list of %m-%d strings and calculate the normals for each date
    normals = [daily_normals(city, d)[0] for d in extd]
    
    # Convert extended dates to strings
    string_dates = [str(ed) for ed in ext_dates]

    # Create a list of daily normals for each day and 
    # append  them to the list
    wh_normals = []
    for i in range((end_new - start_new).days +1):
        a, b, c = normals[i]
        wh_normals.append([string_dates[i], a, b , c])
  
    # Create a list of column names
    column_names = ["date", "tmin", "tavg", "tmax"]

    # Initialize main_dict and wh_dict
    main_dict = {}
    wh_dict = {}

    # Create weather history dictionary
    wh_dict["city"] = city
    wh_dict["column_names"] = column_names
    wh_dict["start_date"] = startd
    wh_dict["end_date"] = endd
    wh_dict["data"] = wh_normals
    # Add wh_dict to main dictionary as a "dataset" key
    main_dict["dataset"] = wh_dict

    return jsonify(main_dict)

# Map local attractions 
@app.route("/api/<city>")
def scrape(city):
    
    # Create URL
    baseURL = "https://maps.googleapis.com/maps/api/place/textsearch/json?"
    attraction = "museums"
    location = "+".join(city.split(" "))
     
    url = baseURL + 'query=' + location + '+' + attraction + '&language=en&key=' + g_key
    
    # Create a dictionary with retrieved data and jsonify
    dataset = {}
    data = requests.get(url).json()
    dataset['data'] = data      
    
    return jsonify(dataset)


# start the server with the 'run()' method
if __name__ == '__main__':
    app.run(debug=True)
