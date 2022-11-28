# Travel Tips Dashboard

**This project is deployed to Render:**  [https://travel-tips-dashboard.onrender.com](https://travel-tips-dashboard.onrender.com)

### Objective

This was a team project and its purpose was to create a travel tips dashboard combining different data sources. Users are able to choose from a selection of top 5 US destinations. The dashboard will display minimum flight prices originated from Indianapolis,  destination city historical temperatures for the trip dates (plus 1 week after and before), and destination city attractions on a leaflet map.

For the initial load the dashboard displays historical temperatures for Indianapolis (1 week before and 2 weeks after the current day) together with Indianapolis attractions.

### Data Source

- **Flight data:** https://rapidapi.com/skyscanner/api/skyscanner-flight-search

- **Historical weather data:**  [Visual Crossing Corporation](https://www.visualcrossing.com/) 

- **Museum data:** [Google Places API Text Search Service](https://developers.google.com/places/web-service/search#TextSearchRequests) that returns information about a set of places based on a string. This is an HTML URL example for querying museums in New York City: 

  ```
  https://maps.googleapis.com/maps/api/place/textsearch/json?query=new+york+city+museums&language=en&key=API_KEY
  ```

  

### ETL for Historical Weather

- Historical weather data was downloaded for five chosen cities plus Indianapolis for years 2010 - 2019 inclusive.
- Due to limitation to the number of results per query, we downloaded data to 4 CSV files.
- The following steps could be seen in details in the notebook *ETL_for_Travel_Tips_Dashboard.ipynb*:
  - The files were loaded to Pandas dataframe and then joined.
  - We removed not needed columns and sorted dataframe per location and date in ascending order.
  - The index was named so it could be used as a primary key in a database table.
  - The Python library **Pandabase** was used to create SQLite database from our dataframe.
  - We checked the database with SQLAlchemy by running several queries.
- The final table consists of 21912 rows and 9 columns



### Flask and API

There are three routes in the script *app.py*:

- ***/*** 

  This route renders our *index.html*.

  

- ***/api/\<city>/\<startd>/\<endd>*** 

  For the selected city and the range of dates, the script first calculates daily normals (minimum, maximum and average temperature for a particular month-day through the collected period of years) from the last 10 years of historical data in our SQLite database.
  
  The script then returns a dictionary that is converted to JSON format and this API can be reached by our script *tt-dashboard/static/js/app-damir.js* in the above endpoint (route):
  
  ```
  {
    "dataset": {
      "city": "Indianapolis", 
      "column_names": [
        "date", 
        "tmin", 
        "tavg", 
        "tmax"
      ], 
      "data": [
        [
          "2020-07-04", 
          67.8, 
          76.4, 
          88.1
        ], 
        [
          "2020-07-05", 
        ...
  ```



- ***/api/\<city>*** 

  For the selected city the scripts creates a query URL for museums using Google Places API and calls *requests.get()*. Retrieved data in a JSON format is wrapped in a dictionary and placed in the above endpoint to be accessed by our script *tt-dashboard/static/js/app-damir.js*:

  ```
  {
    "data": {
      "html_attributions": [], 
   ...
   
      "results": [
        {
          "business_status": "OPERATIONAL", 
          "formatted_address": "11 W 53rd St, New York, NY 10019, United States", 
          "geometry": {
            "location": {
              "lat": 40.7614327, 
              "lng": -73.97762159999999
   ...
   
          "name": "The Museum of Modern Art", 
          "opening_hours": {
            "open_now": true
          }, 
   ...
  ```



### Plotting Daily Normals

After data submission on the web page, *index.html* uses 

>  onclick="optionChanged()"

to run the function **optionChanged** in the script *tt-dashboard/static/js/main_template.js*.

This function will pull the selected variables from html and start the function **weatherHistoryPlot** that will first create a URL for our API using selected data. The plot will be created with Plotly using data retrieved from our API.

The function plots data for the selected date range plus 1 week before and after. For the initial load, the plotting function assumes Indianapolis as a city and for the date range a week starting with the current day.



### Mapping Attractions

The function **mappingAttractions** will be started the same way as the function **weatherHistoryPlot**. It will plot markers for selected city attractions using Leaflet.js on a MapBox map.



### Tools / Techniques Used:

- JavaScript

- Leaflet.js

- D3.js

- Python

- HTML/CSS

- Plotly

- [Mapbox API](https://www.mapbox.com/)

- [Google Places API](https://developers.google.com/places/web-service/search#TextSearchRequests)

- Flask

- SQLAlchemy

- SQLite

- Pandabase

  

#### Team Members:

- Damir Zunic ([zunicd@yahoo.com](mailto:zunicd@yahoo.com)):
  - everything listed above
- Kevin Scoleri ([kscoleri89@gmail.com](mailto:kscoleri89@gmail.com)):
  - web page design (HTML, CSS, Bootstrap)
- Nate Newcomer (nsnewcomer92@gmail.com):
  - flight data collection, analysis and visualization (JavaScript, jQuery)

















