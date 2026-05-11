const axios = require('axios');

async function testSearch() {
  const query = `
    query {
      Page(page: 1, perPage: 5) {
        media(type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            english
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post('https://graphql.anilist.co', { query }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
  }
}

testSearch();
