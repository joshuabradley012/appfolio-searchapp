/**
 * AppFolio Listing Scraper
 * ./appfolio-searchapp//middleware/scrape-appfolio.js
 * 4/7/2018
 * Josh Bradley
 * 
 * @requires puppeteer
 */

module.exports = getListings;

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

async function getListings(options) {

  const subdomains = new Object();
  let inputSubdomains = options.subdomains

  console.log(inputSubdomains);

  let i = 0;
  for (var inputKey in inputSubdomains) {
    const key = 'subdomain' + i;
    subdomains[key] = inputSubdomains[inputKey].url;
    i++;
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

        let image = document.querySelector('.gallery__large-image-link');
        let h1 = document.querySelector('h1');
        let rent = document.querySelector('.sidebar__price');
        let size = document.querySelector('.sidebar__beds-baths');
        let contact = document.querySelector('.u-pad-bl');
        let info = document.querySelector('.listing-detail__body');

        if (image) {
          listingProperty['img'] = image.outerHTML.match(/href="(.*?)"/i)[1].replace('large', 'small');
        }
        else {
          listingProperty['img'] = 'https://assets.cdn.appfolio.com/listings/assets/listings/rental_listing/no_photo-ea9e892a45f62e048771a4b22081d1eed003a21f0658a92aa5abcfd357dd4699.png';
        }

        if (h1) listingProperty['address'] = h1.textContent;
        if (rent) listingProperty['rent'] = rent.textContent;
        if (size) listingProperty['size'] = size.textContent;
        if (contact) listingProperty['contact'] = contact.textContent;
        if (info) listingProperty['text'] = info.textContent;

        const propertyKeys = Object.keys(listingProperty);

        for (const property of propertyKeys) {

          if (listingProperty[property] !== null && typeof(listingProperty[property]) !== 'undefined' && listingProperty[property] !== '') {
            // remove HTML whitespace and unnecessary phrases
            listingProperty[property] = listingProperty[property].replace(/\n/gi, ' ');
            listingProperty[property] = listingProperty[property].replace(/\s+/gi, ' ');
            listingProperty[property] = listingProperty[property].replace(/view\sall\slistings/gi, '');
            listingProperty[property] = listingProperty[property].replace(/MAP/g, '');
            listingProperty[property] = listingProperty[property].trim();
          }
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