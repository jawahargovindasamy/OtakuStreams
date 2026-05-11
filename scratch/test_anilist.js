const axios = require('axios');

async function testSearch() {
  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 5) {
        media(search: $search, type: ANIME) {
          id
          title {
            english
            romaji
          }
        }
      }
    }
  `;
  const variables = { search: "one piece" };

  try {
    const response = await axios.post('https://graphql.anilist.co', { query, variables });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
  }
}

testSearch();
