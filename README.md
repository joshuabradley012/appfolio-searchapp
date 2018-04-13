# AppFolio Listing Search Tool

## Usage

Using this tool, you can schedule appfolio domains to be scraped and available for search.

It is availbale on this URL: [https://appfoliosearch.herokuapp.com/](https://appfoliosearch.herokuapp.com/)

You can add subdomains to be scraped using the form in the sidebar. Keep in mind, listings from those URLs will not be immediately availble. To keep things ethical and efficient, listings are crawled at 1:00am every day. So, subdomains you add today will be searchable tomorrow.

When adding subdomains, they must be an appfolio subdomain. You can either add the full URL such as `https://solarentals.appfolio.com` or simply the subdomain `solarentals`.

When searching, your query will act as an OR statement. So searching `section 8` searches for listings that match `section` OR `8`. To refine this to a phrase match, use quote such as `"section 8"`.

To sort search results, you must click search again to see changes.