# AppFolio Listing Search Tool

## Installation (Mac)

Download the ZIP file and unzip it on your desktop or install GitHub and clone the repo:

    git clone git@github.com:joshuabradley012/appfolio-searchapp.git

Node is required, [install node](https://nodejs.org/):

    brew install node

Ensure node is installed by checking the version:

    node -v
    npm -v
    
Install the dependencies:

    cd ~/appfolio-searchapp
    npm install

## Usage

You can search through multiple domains in bulk and can customize your search string or search with [regex](http://www.regular-expressions.info/). Keep in mind this is a very rigid search; it searches for your input exactly (case insensitive), eg 'section' vs 'sections' will return different results but 'section' vs 'Section' will return the same.

Start the app:

    npm start
    
Run a debugger during development:

    DEBUG=appfolio-searchapp:* & npm run devstart
