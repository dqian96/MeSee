# MeSee
MeSee consists of 3 components:
* Javascript frontend: 
  * Single page web app
  * Draws fragments on top of Google Maps API to visualize data pertaining to each region/district 
  * Sends and recieve data to backend
* Node.js backend:
  * Relay data pertaining to regions for frontend visualization
  * Queries Google Maps API, Yelp API, and scraped data in order to calculate where an user should live using a proprietary algorithm
* Scripts: 
  * Scrape data off Wikipedia and other public sources...data includes income, crime, age, ethnicity proportions, etc.
