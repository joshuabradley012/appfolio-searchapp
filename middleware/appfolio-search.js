/**
 * AppFolio Listing Search Middleware
 * ./appfolio_searchapp//middleware/appfolio_search.js
 * 03.19.2018
 * Josh Bradley
 * 
 * @requires puppeteer
 */

module.exports = getListings;

/**
 * Dependencies
 */

const puppeteer = require('puppeteer');

/**
 * Collect data from listings and return a simple object
 *
 * @param {Object} options - search string, subdomains, and arguments
 */

async function getListings(options) {

  const subdomains = new Object();
  const search = options.search;
  const args = options.args;
  let inputSubdomains = options.subdomains.toString();

  inputSubdomains = inputSubdomains.replace(/\s*,\s*/, ',');
  inputSubdomains = inputSubdomains.split(',');

  for (let i = 0; i < inputSubdomains.length; i++) {
    const subdomain = inputSubdomains[i];
    const key = 'subdomain' + i;
    subdomains[key] = subdomain;
  }

  const listingUrls = await scrapeSubdomains(subdomains);
  console.log('Seaching for "' + search + '"');
  
  const allListings = await searchListings('[^no]?\s?' + search, listingUrls);

  if (Object.keys(allListings).length === 0) {
    console.log('No listings found.');
    return allListings;
  }

  if (Object.keys(allListings).length > 0) {
    console.log('Search complete.');
    return allListings;
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

      const listingPage = 'https://' + subdomains[subdomain] + '.appfolio.com/listings/';
      await page.goto(listingPage);

      listings[subdomains[subdomain]] = await page.evaluate((subdomains, subdomain) => {

        const urlObject = new Object();
        const html = document.all[0].outerHTML;
        const urls = html.match(/<a.*?>.*?View Details.*?<\/a>/gi);

        if (urls) {
          for (let i = 0; i < urls.length; i++) {
            const key = 'listing'  + i;
            let url = urls[i].match(/href="(.*?)"/i)[1];
            urlObject[key] = 'https://' +  subdomains[subdomain] + '.appfolio.com' + url;
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
 * Search each listing url for the keyphrase, if there is a match, extract key data
 *
 * @param {string} search - user search string
 * @param {Object} listingUrls - urls scraped from the listing pages
 */

async function searchListings(search, listingUrls) {

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

      let results = await page.evaluate((search) => {
        const html = document.all[0].outerHTML;
        const matches = html.match(new RegExp(search, 'gi'));

        if (matches) return true;
        if (!matches) return false;

      }, search);

      if (results) {

        listingObject[listing] = await page.evaluate((allListingUrls, listing) => {

          const listingProperty = new Object();

          listingProperty['URL'] = allListingUrls[listing];
          listingProperty['Address'] = document.querySelector('h1').textContent;
          listingProperty['Rent'] = document.querySelector('.sidebar__price').textContent;
          listingProperty['Size'] = document.querySelector('.sidebar__beds-baths').textContent;
          listingProperty['Contact'] = document.querySelector('.u-pad-bl').textContent;

          const propertyKeys = Object.keys(listingProperty);

          for (const property of propertyKeys) {
            // remove HTML whitespace and unnecessary phrases
            listingProperty[property] = listingProperty[property].replace(/\n/gi, ' ');
            listingProperty[property] = listingProperty[property].replace(/\s+/gi, ' ');
            listingProperty[property] = listingProperty[property].replace(/view\sall\slistings/gi, '');
            listingProperty[property] = listingProperty[property].replace(/MAP/g, '');
            listingProperty[property] = listingProperty[property].trim();
          }

          return listingProperty;
          
        }, allListingUrls, listing);

      } // end if

      console.log(Math.floor((loopCount / total) * 100) + '% complete (Checked listing ' + loopCount + '/' + total + ')');
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