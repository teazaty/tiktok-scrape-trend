const fs = require('fs');
const readline = require('readline');
const { ApifyClient } = require('apify-client');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function scrapeTrendingVideos(region, limit, useApifyProxy = true) {
  const client = new ApifyClient({
    token: 'apify_api_dt9rbAgd6ktQ5RlEUktweFHPNTP7mf1x41hZ',
  });

  const input = {
    region,
    limit,
    proxyConfiguration: { useApifyProxy },
  };

  const run = await client.actor('4pk0g8nqBJorlmlx9').call(input);

  const scrapedData = [];
  const dataset = await client.dataset(run.defaultDatasetId).listItems();
  for (const item of dataset.items) {
    scrapedData.push(item);
  }

  return scrapedData;
}

function saveVideoUrlsToFile(fileName, videoUrls) {
  fs.writeFileSync(fileName, videoUrls.join('\n'));
}

async function main() {
  console.log('TikTok Data Scraping');
  rl.question("Enter region code (e.g., 'US' for United States): ", async (region) => {
    rl.question('Enter the limit for results: ', async (limit) => {
      rl.question('Use proxy? (y/n): ', async (useProxy) => {
        const useApifyProxy = useProxy.toLowerCase() === 'y';

        const parsedLimit = parseInt(limit, 10);
        if (!isNaN(parsedLimit) && parsedLimit >= 1) {
          console.log('Scraping trending videos...');
          const trendingData = await scrapeTrendingVideos(region, parsedLimit, useApifyProxy);

          const trendingVideoUrls = trendingData
            .filter((item) => item.hasOwnProperty('share_url'))
            .map((item) => item.share_url.split('?')[0]);
          saveVideoUrlsToFile('trending.txt', trendingVideoUrls);

          console.log("Trending Video URLs saved to 'trending.txt'");
        } else {
          console.log('Invalid limit. Please enter a valid integer greater than or equal to 1.');
        }

        rl.close();
      });
    });
  });
}

main();
