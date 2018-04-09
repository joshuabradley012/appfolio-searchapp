/**
 * AppFolio Listing Scraper
 * ./appfolio-searchapp//middleware/scrape-appfolio.js
 * 4/7/2018
 * Josh Bradley
 * 
 * @requires puppeteer
 */

/**
 * Dependencies
 */

const puppeteer = require('puppeteer');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/listings');
const Listing = require('../models/listing.js');

/**
 * Collect data from listings and return a simple object
 *
 * @param {Object} options - search string, subdomains, and arguments
 */

const options = new Object();
options.subdomains = ['https://rohcs.appfolio.com', 'https://solarentals.appfolio.com'];

getListings(options);

async function getListings(options) {

  const subdomains = new Object();
  let inputSubdomains = options.subdomains.toString();

  inputSubdomains = inputSubdomains.replace(/\s*,\s*/, ',');
  inputSubdomains = inputSubdomains.split(',');

  for (let i = 0; i < inputSubdomains.length; i++) {
    const subdomain = inputSubdomains[i];
    const key = 'subdomain' + i;
    subdomains[key] = subdomain;
  }

  const listingUrls = await scrapeSubdomains(subdomains);
  
  const allListings = await scrapeListings(listingUrls);

  if (Object.keys(allListings).length === 0) {
    console.log('No listings found.');
  }

  if (Object.keys(allListings).length > 0) {
    console.log('Scrape complete.');

    mongoose.connection.db.dropCollection('listings', function(err) {
      if (err) console.log(err);
    });

    let listingKeys = Object.keys(allListings);
    for (const listing of listingKeys) {
      new Listing(allListings[listing]).save().catch((err)=>{
        console.log(err.message);
      });
    }
    //console.log(allListings);
  }
}

/**
 * Scrape each subdomain for listing urls
 *
 * @param {Object} subdomains - urls of appfolio subdomains
 */

async function scrapeSubdomains(subdomains){

  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  console.log('Gathering listings...');

  try {

    const subdomainKeys = Object.keys(subdomains);
    let listings = new Object();

    for (const subdomain of subdomainKeys) {

      const listingPage = subdomains[subdomain] + '/listings/';
      await page.goto(listingPage);

      listings[subdomains[subdomain]] = await page.evaluate((subdomains, subdomain) => {

        const urlObject = new Object();
        const html = document.all[0].outerHTML;
        const urls = html.match(/<a.*?>.*?View Details.*?<\/a>/gi);

        if (urls) {
          for (let i = 0; i < urls.length; i++) {
            const key = 'listing'  + i;
            let url = urls[i].match(/href="(.*?)"/i)[1];
            urlObject[key] = subdomains[subdomain] + url;
          }
        }

        return urlObject;

      }, subdomains, subdomain);
      
    } // end for

    return listings;

  } catch(e) {
    console.log(e);
  } finally {
    await browser.close();
  }
}

/**
 * Extract listing data to put in database
 *
 * @param {Object} listingUrls - urls scraped from the listing pages
 */

async function scrapeListings(listingUrls) {

  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();

  try {

    let listingObject = new Object();
    let loopCount = 1;

    const allListingUrls = flattenObject(listingUrls);
    const listingKeys = Object.keys(allListingUrls);
    const total = listingKeys.length;

    for (const listing of listingKeys) {

      await page.goto(allListingUrls[listing]);

      listingObject[listing] = await page.evaluate((allListingUrls, listing) => {

        const listingProperty = new Object();

        listingProperty['url'] = allListingUrls[listing];
        listingProperty['img'] = document.querySelector('.swipebox.gallery__large-image-link').outerHTML.match(/href="(.*?)"/i)[1];
        listingProperty['address'] = document.querySelector('h1').textContent;
        listingProperty['rent'] = document.querySelector('.sidebar__price').textContent;
        listingProperty['size'] = document.querySelector('.sidebar__beds-baths').textContent;
        listingProperty['contact'] = document.querySelector('.u-pad-bl').textContent;
        listingProperty['text'] = document.querySelector('.listing-detail__body').textContent;
        listingProperty

        const propertyKeys = Object.keys(listingProperty);

        for (const property of propertyKeys) {
          // remove HTML whitespace and unnecessary phrases
          listingProperty[property] = listingProperty[property].replace(/\n/gi, ' ');
          listingProperty[property] = listingProperty[property].replace(/\s+/gi, ' ');
          listingProperty[property] = listingProperty[property].replace(/view\sall\slistings/gi, '');
          listingProperty[property] = listingProperty[property].replace(/MAP/g, '');
          listingProperty[property] = listingProperty[property].trim();
        }

        listingProperty['rent'] = listingProperty['rent'].replace(/\D/g, '');

        return listingProperty;
        
      }, allListingUrls, listing);

      console.log(Math.floor((loopCount / total) * 100) + '% complete (' + loopCount + '/' + total + ')');
      loopCount++;

    } // end for

    return listingObject;

  } catch(e) {
    console.log(e);
  } finally {
    await browser.close();
  }
}

/**
 * Convert nested object into single dimensional key value pairs
 *
 * @param {Object} obj
 */

function flattenObject(obj) {

  var toReturn = {};

  for (var i in obj) {

    if (!obj.hasOwnProperty(i)) continue;

    if ((typeof obj[i]) == 'object') {

      var flatObject = flattenObject(obj[i]);

      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }

    } else {
      toReturn[i] = obj[i];
    } // end if
  } // end for

  return toReturn;

}

module.exports = getListings;