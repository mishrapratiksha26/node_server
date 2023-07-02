const express = require("express");
const axios = require("axios");
const cors = require("cors");
const {
  scrapeWebsite,
} = require("./webScrapper"); // Import the scraping logic

const app = express();
app.use(cors());
app.use(express.json());

app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  console.log(url);
  try {
    const scrapedText = await scrapeWebsite(url); // Perform the scraping logic
    const articles = scrapedText.split("\n\n").map((text, index) => {
      const lines = text.split("\n");
      const title = lines[0];
      const content = lines.slice(1).join("\n");
      return {
        article_id: index + 1,
        title: title.trim(),
        content: content.trim(),
      };
    });

    const filteredArticles = articles.filter(
      (article) => article.title !== "" && article.content !== ""
    );
    console.log(filteredArticles);
    res.json(filteredArticles);
  } catch (error) {
    console.error("Error scraping website:", error);
    res.status(500).json({ error: "Error scraping website" });
  }
});

// Dummy database
let documents = [];

// Generate a unique document ID
function generateDocumentId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

app.post("/documents", (req, res) => {
  const { fileName } = req.body;
  const documentId = generateDocumentId();
  documents.push({ id: documentId, fileName: fileName });

  res.json({ id: documentId });
});

app.post("/documents/:id/scan", (req, res) => {
  const { id } = req.params;
  const document = documents.find((doc) => doc.id === id);

  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }
  return res.json({ message: "Document scanned successfully" });
});

app.post("/documents/:id/delete", (req, res) => {
  const { id } = req.params;
  const documentIndex = documents.findIndex((doc) => doc.id === id);

  if (documentIndex === -1) {
    return res.status(404).json({ error: "Document not found" });
  }
  const deletedDocument = documents.splice(documentIndex, 1)[0];
  res.json({ message: "Document deleted successfully", deletedDocument });
});

app.post("/proxy", async (req, res) => {
  try {
    const response = await axios.post(
      "https://readyly.onrender.com/process_query",
      req.body
    );
    console.log("Respone", response.data.response, response.data.query);
    res.send(response.data);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});
const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
