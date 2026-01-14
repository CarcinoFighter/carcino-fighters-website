const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({
    auth: "ntn_V33599810734dShPceMK0H5czr18eMS1Q3Uk4E7S9wv5MM",
});

const DATABASE_ID = "2680c8453e1180c0ad73f9cf08bb6166";

async function test() {
    console.log("Starting Notion Test...");
    try {
        const response = await notion.databases.query({
            database_id: DATABASE_ID,
        });
        console.log("SUCCESS! Connection established.");
        console.log(`Results found: ${response.results.length}`);

        if (response.results.length > 0) {
            const firstPage = response.results[0];
            console.log("--- First Page Data ---");
            console.log("ID:", firstPage.id);
            console.log("Properties Keys:", Object.keys(firstPage.properties));

            // Detailed dump of properties to see types
            for (const [key, val] of Object.entries(firstPage.properties)) {
                console.log(`Property [${key}]: type=${val.type}`);
            }
        } else {
            console.log("No pages found in the database. Check if you have added the integration to the database!");
        }
    } catch (error) {
        console.error("FAILURE!");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
    }
}

test();
