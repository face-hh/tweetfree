function scrape() {
    let arr = [];
    const authorXpath = "//*[starts-with(@id, 'id__')]/div[2]/div/div[1]/a/div/span";
    const authorElements = document.evaluate(authorXpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    function xpathDecode(xpath, i) {
        const contentElements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        return contentElements.snapshotItem(i);
    }

    for (let i = 0; i < authorElements.snapshotLength; i++) {
        const authorElement = authorElements.snapshotItem(i);

        let contentElement = xpathDecode("//*[starts-with(@id, 'id__')]/span[2]", i);

        if (contentElement === null) contentElement = xpathDecode("//*[starts-with(@id, 'id__')]/span", i);

        const author = authorElement.innerText;
        let content = contentElement.innerText;

        let mentioned = false;

        if (content[0] === " ") {
            mentioned = true;
            content = content.substring(1);
        }

        var obj = { author, content, mentioned };
        arr.push(obj);
    }

    return arr;
}

scrape();