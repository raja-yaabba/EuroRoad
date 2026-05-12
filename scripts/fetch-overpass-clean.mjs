import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.resolve("public", "data");

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const jobs = [
  ["overpass_motorways_fr.query", "osm_motorways_fr.json"],
];

function cleanQuery(query) {
  return query
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

async function fetchOverpass(query, label) {
  for (const endpoint of ENDPOINTS) {
    console.log(`Fetching ${label} via ${endpoint}...`);
    console.log("QUERY SENT:\n" + query);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          "User-Agent": "EuroRoadAtlas/1.0",
        },
        body: query,
      });

      const text = await response.text();

      if (!response.ok) {
        console.warn(`Failed on ${endpoint}: HTTP ${response.status}`);
        console.warn(text.slice(0, 1000));
        continue;
      }

      const json = JSON.parse(text);
      console.log(`Loaded ${json.elements?.length ?? 0} elements`);
      return json;
    } catch (error) {
      console.warn(`Failed on ${endpoint}: ${error.message}`);
    }
  }

  throw new Error(`All endpoints failed for ${label}`);
}

async function main() {
  for (const [queryFile, outputFile] of jobs) {
    const queryPath = path.join(DATA_DIR, queryFile);
    const outputPath = path.join(DATA_DIR, outputFile);

    let query = await fs.readFile(queryPath, "utf8");
    query = cleanQuery(query);

    if (query.includes("area")) {
      throw new Error(`${queryFile} still contains area query.`);
    }

    const json = await fetchOverpass(query, queryFile);

    await fs.writeFile(outputPath, JSON.stringify(json, null, 2), "utf8");
    console.log(`Saved ${outputFile}`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
