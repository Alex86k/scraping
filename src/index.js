const puppeteer = require('puppeteer');
const fs = require('fs');
const Json2csv = require('json2csv').Parser;

(async () => {
    const result = []
    const browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox']
        }
    );
    const page = await browser.newPage();
    const pageURL = 'https://www.watchfinder.com/search?filterBrands=Omega&filterBrands=Rolex';

    try {
        await page.goto(pageURL);
    } catch (error) {
        console.log(error);
    }

    const postsSelector = '.col-md-3 .prods_content a';
    await page.waitForSelector(postsSelector, {timeout: 0});
    const postUrls = await page.$$eval(
        postsSelector, postLinks => postLinks.map(link => link.href)
    );


    for (let i = 0; i < 10; i++) {
        let postUrl = postUrls[i]
        try {
            await page.goto(postUrl);
        } catch (error) {
            console.log(error);
        }

        const brandSelector = '.prod_brand';
        await page.waitForSelector(brandSelector);
        const brand = await page.$eval(
            brandSelector, brandSelector => brandSelector.innerHTML
        );

        const modelSelector = '.prod_series';
        await page.waitForSelector(modelSelector);
        const model = await page.$eval(
            modelSelector, modelSelector => modelSelector.innerHTML
        );

        const referenceNumberSelector = '.prod_model';
        await page.waitForSelector(referenceNumberSelector);
        const referenceNumber = await page.$eval(
            referenceNumberSelector, referenceNumberSelector => referenceNumberSelector.innerHTML
        );

        const caseSize = await page.evaluate(() => {
            const caseSizeSelector = '.prod_info-table tbody tr';
            return [...document.querySelectorAll(caseSizeSelector)]
                .find(e => e.innerText.includes('Case size'))
                .querySelectorAll('td')[1].innerText
        })
        result.push({
            'Brand': brand,
            'Model': model,
            'Reference number': referenceNumber,
            'Case size': caseSize
        })

    }
    const j2csv = new Json2csv(['Brand', 'Model', 'Reference number', 'Case size']);
    const csv = j2csv.parse(result);
    fs.writeFileSync('./result.csv', csv, 'utf-8')

    await browser.close();



})();
