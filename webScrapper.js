const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeWebsite(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Remove script and style tags
    $("script, style").remove();

    let text = "";
    $("body")
      .find("*")
      .each((_, element) => {
        const node = $(element);
        if (node.text().trim()) {
          text += node.text().trim() + "\n";
        }
      });

    return text;
  } catch (error) {
    console.error("Error scraping website:", error);
    throw error;
  }
}

module.exports = { scrapeWebsite };
