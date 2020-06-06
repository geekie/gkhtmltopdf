const chromium =  require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

exports.handler = async (event) => {
  console.log(event.body);

  const eventBody = JSON.parse(event.body);
  const executablePath = event.isOffline
    ? "./node_modules/puppeteer/.local-chromium/mac-674921/chrome-mac/Chromium.app/Contents/MacOS/Chromium"
    : await chromium.executablePath;

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath
  });

  const page = await browser.newPage();

  const pageLoadOptions = {
    waitUntil: ["networkidle0", "load", "domcontentloaded"]
  };

  if (eventBody.url) {
    await page.goto(eventBody.url, pageLoadOptions);
  } else if (eventBody.html) {
    await page.setContent(eventBody.html, pageLoadOptions);
  } else {
    return {
      statusCode: 400,
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify("Must provide either `html` or `url` on the request body")
    };
  }  

  const pdfOptions = Object.assign(
    {
      printBackground: true,
      format: 'A4',
      margin: { top: '0.4in', right: '0.4in', bottom: '0.4in', left: '0.4in' }
    },
    eventBody.options
  );

  const pdfStream = await page.pdf(pdfOptions);

  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      "Content-type": "application/pdf"
    },
    body: pdfStream.toString("base64")
  };
};


