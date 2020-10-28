const { parsePrice } = require("../utils");

const $$_SECTION = "ghs-restaurant-menu-section";
const $$_CATEGORY = "h3.menuSection-title";
const $$_PRODUCT = ".menuItem";
const $$_NAME = "a.menuItem-name";
const $$_DESCRIPTION = "p[data-testId='description']";
const $$_PRICE = "span[data-testId='menu-item-price']";
const $$_IMAGE = "img[data-testId='lazy-image']";

module.exports = async ({ page } = {}) => {
    try {
        await page.waitFor($$_SECTION);
        const sections = await page.$$($$_SECTION);

        const productMap = {};
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const category = await section.$eval($$_CATEGORY, e => e.innerText);

            const productContainers = await section.$$($$_PRODUCT);

            for (let j = 0; j < productContainers.length; j++) {
                const productContainer = productContainers[j];

                const name = await productContainer.$eval($$_NAME, e => e.innerText).catch(console.error);
                let description;
                try {
                    description = await productContainer.$eval($$_DESCRIPTION, e => e.innerText);
                } catch (error) { }
                const price = await productContainer.$eval($$_PRICE, e => e.innerText).catch(console.error);
                let image;
                try {
                    image = await productContainer.$eval($$_IMAGE, e => e.src);
                } catch (error) { }
                if (image) {
                    await productContainer.click();
                    await page.waitFor("ghs-menu-item-add form");
                    image = await page.$eval("ghs-menu-item-add form header", e => e.style.backgroundImage.slice(5).slice(0, -2));
                    await page.evaluate(() => {
                        document.querySelector("ghs-menu-item-add form header button").click();
                    });
                    await page.waitFor("ghs-menu-item-add form", { hidden: true });
                }

                if (productMap[name]) {
                    productMap[name] = {
                        ...productMap[name],
                        description: productMap[name].description ? productMap[name].description : description,
                        categories: [...productMap[name].categories, category],
                    };
                }
                else {
                    productMap[name] = {
                        name,
                        description,
                        price: parsePrice(price),
                        image,
                        categories: [category],
                    }
                }
            }
        }

        return Object.values(productMap);
    } catch (e) {
        throw e;
    }
};