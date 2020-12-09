const csv = require('csvtojson');

function itemPresent(items, itemToFind) {
    let present = false
    items.forEach(item => {
        if (itemToFind["barcode"] === item["barcode"]) {
            present = true;
        }
    });
    return present;
}

function sortByProperty(property) {
    return function (current, next) {
        if (current[property] > next[property]) return 1;
        else if (current[property] < next[property]) return -1;
        return 0;
    }
}


function chooseBestPromo(items, promo) {
    let totalAmount = 0;
    items.forEach(item => {
        const product = promo[item.barcode].sort(sortByProperty("amount"));

        for (let i = product.length - 1; i >= 0; i--) {
            const bestPromo = product[i];
            const promoInProducts = Math.floor(item.count/bestPromo.amount);
            if (promoInProducts > 0) {
                const fractionPrice = (promoInProducts * parseFloat(bestPromo.price.replace(",","."))).toFixed(2);
                totalAmount = totalAmount + Number(fractionPrice);
            }
            item.count = item.count - (promoInProducts * bestPromo.amount);
        }
    });
    console.log(`\nTotal amount to pay is \$${totalAmount}`);
}

function calculatePayment(items) {
    csv().fromFile("promo.csv").then(json => {
        const promo = {}
        json.forEach(item => {
            if (promo.hasOwnProperty(item.barcode)) {
                promo[item.barcode].push({name: item.name, amount: item.amount, price: item.price});
            } else {
                promo[item.barcode] = [{name: item.name, amount: item.amount, price: item.price}];
            }
        });
        chooseBestPromo(items, promo);
    });
}

function displayProducts(items) {
    console.log("Picked up products: ");
    items.forEach(item => {
        console.log(` - ${item.count} of product ${item.barcode}`);
    })
}

function generatePrice(receive) {
   csv().fromFile(receive).then(json => {
       const items = []
       json.forEach(item => {
          if (itemPresent(items, item)) {
              const product = getItem(items, item);
              product.count++;
          } else {
              items.push({barcode: item["barcode"], count: 1});
          }
       });
       calculatePayment(items);
       displayProducts(items);
   });
}

function getItem(items, itemToFind) {
    let present = null;
    items.forEach(item => {
        if (itemToFind["barcode"] === item["barcode"]) {
            present = item;
        }
    });
    return present;
}

generatePrice("basket1.csv");