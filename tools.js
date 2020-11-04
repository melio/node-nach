const fs = require('fs').promises;
const File = require('./lib/file');

async function achToJson() {
    const fileName = process.argv[2];
    const achFile = await File.parseFile(fileName);
    const j = achFile.toJson();
    await fs.writeFile(fileName + ".json", JSON.stringify(j, null, 4));
  }

// eslint-disable-next-line no-console
achToJson().catch(console.error.bind(console));