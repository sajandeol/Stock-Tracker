/**
 * Captures button pressed and Stock Ticker search inputs
 * for TSX stocks adds a .TO to the end
 * returns redirectCall
 */
function getStock() {
  let exchange = document.getElementById("exchange").value;
  let stockTicker = document.getElementById("symbol").value;
  let combined;
  if (exchange == "TO") {
    combined = stockTicker + "." + exchange;
  } else {
    combined = stockTicker;
  }
  redirectCall(combined);

}
/**
 * Calls API function from app.py when sucess is return 
 * set data to session variableand relocate window to quote.html page
 * @param {String} combined The symbol plus the ticker symbol
 */
function redirectCall(combined) {
  //Wait for callAPI to finish
 
  let dict_values = {
    combined
  } 
  //Pass the javascript variables to a dictionary.
  let s = JSON.stringify(dict_values);
  // Stringify converts a JavaScript object or value to a JSON string
  $.ajax({
    url: "/callStock",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(s),
    success: function (values) {
      let json_parse = JSON.parse(values);
      sessionStorage.setItem(combined, JSON.stringify(json_parse));
      sessionStorage.setItem("symbol", combined);
      window.location.href = "/quote";
    }
  });
}
/**
 * Using ajax and flask calls callAPI function and on sucess sets data to session Storage
 * @param {String} combined The symbol plus the ticker symbol
 */
function callAPI(combined) {
  let dict_values = {
    combined
  } //Pass the javascript variables to a dictionary.
  let s = JSON.stringify(dict_values);
  // Stringify converts a JavaScript object or value to a JSON string
  $.ajax({
    url: "/callStock",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(s),
    success: function (values) {
      let json_parse = JSON.parse(values);
      sessionStorage.setItem(combined, JSON.stringify(json_parse));
    }
  });

}
/**
 * Displays the data on index.html page for onLoad
 * @param {String} symbol stock Ticker with Exchange extension for TSX
 */
function displayStaticResults(symbol){
  let json_parse = JSON.parse(sessionStorage.getItem(symbol));
    //Change color of DayChangeElement
    let dayChange = json_parse.dayChange;
    let dayChangeElement = document.getElementById("dayChange"+symbol);
    if(Math.sign(dayChange) == -1){
      dayChangeElement.style.color = "red";
    }else{
      dayChangeElement.style.color = "green";
  
    }
    //Set elemets to html page
    document.getElementById("price"+symbol).innerHTML="Price: "+json_parse.lastPrice.toFixed(2);
    dayChangeElement.innerHTML=dayChange.toFixed(2)+"% Today";
    document.getElementById("open"+symbol).innerHTML="Open: "+json_parse.open.toFixed(2);
    document.getElementById("dayHigh"+symbol).innerHTML="High: "+json_parse.dayHigh.toFixed(2);
    document.getElementById("dayLow"+symbol).innerHTML="Low: "+json_parse.dayLow.toFixed(2);
}
/**
 * Uses Calls API if data has not been set to session varaible
 * otherwise retrieves data for each symbol on index.html page
 * @param {String} symbol stock Ticker with Exchange extension for TSX
 */
function staticCall(symbol){
  //Wait for callAPI to finish
  
  if(sessionStorage.getItem(symbol)=== null){
  callAPI(symbol);
  setTimeout(function(){
    displayStaticResults(symbol);
  }, 4500);
}
  else{
    setTimeout(function(){
    displayStaticResults(symbol);

  }, 50);
}
}

/**
 * Displaying Information and Chart on quote.html page
 * Creates a new link for each news article listed
 */
function displayQuote(){
  let symbol = sessionStorage.getItem("symbol");
  let obj = JSON.parse(sessionStorage.getItem(symbol));
  let graph = JSON.parse(obj.graphJSON);
  Plotly.newPlot('chart', graph);

  let newsUL = document.getElementById("news-list");
  let newsJSON = obj.news;
  newsJSON.forEach((item) => {
    let li = document.createElement("li");
    li.innerHTML = "<a target='_blank' type='button' href='"+item.link+"' id='newsUL' value = 'newsUL'>" +item.title+"</a>";
    newsUL.appendChild(li);
  });

  document.getElementById("exchange").innerHTML = "<strong>Exchange: </strong>"+obj.exchange;
  document.getElementById("lastPrice").innerHTML = "<strong>Price: </strong>"+obj.lastPrice.toFixed(2);
  document.getElementById("previousClose").innerHTML = "<strong>Previous Close: </strong>"+obj.previousClose.toFixed(2);
  document.getElementById("marketCap").innerHTML = "<strong>Market Cap: </strong>"+abbrNum(obj.marketCap, 2);
  document.getElementById("dividends").innerHTML = "<strong>Dividends: </strong>"+obj.dividends;
  document.getElementById("dayHigh").innerHTML = "<strong>Day High/Low: </strong>"+obj.dayHigh.toFixed(2)+" - "+obj.dayLow.toFixed(2);
  document.getElementById("volume").innerHTML = "<strong>Volume: </strong>"+abbrNum(obj.volume, 3);

  let dayChange = Math.round(obj.dayChange * 100) / 100;
  let dayChangeElement = document.getElementById("dayChange")
  dayChangeElement.innerHTML = "Day Change: "+dayChange+"%";
  if(Math.sign(dayChange) == -1){
    dayChangeElement.style.color = "red";
      dayChangeElement.classList.add("market-summary-card-body")
  }else{
    dayChangeElement.style.color = "green";
    dayChangeElement.classList.add("market-summary-card-body")

  }
}
/**
 * The General search Function
 * In Real time grabs the users input and compares them against the 
 * JSON file conttaining all the stocks in all 3 exchanges
 * Then creates a link with the redirectCall function to send to quote.html page
 */
function searchFunction(){
  //get real time typing from input
  let typed= document.getElementById("search").value;
  typed = typed.toUpperCase();
  const elements = document.getElementsByClassName('searchULli');
        while(elements.length > 0){
          elements[0].parentNode.removeChild(elements[0]);
    }
  

$.getJSON("../static/allStocks.json", function(json) {
  let obj = [];
  for(const element of json){
    
    //For TSX Stocks
    if(element.Exchange == 'TSX'){
    let temp = element["Root\nTicker"];
    element.Symbol = temp;
    delete element["Root\nTicker"];
    }


      let stockName = element.Name;
      let symbol = element.Symbol;
      

      let exchange = element.Exchange;
      if(typed.length>=4){
        if (stockName.toUpperCase().indexOf(typed) > -1) {
          if(!obj.includes(symbol+":"+exchange+":"+stockName)){
            obj.push(symbol+":"+exchange+":"+stockName);
          }
      }
    }
    else if(typed.length<4 && typed.length>=1){
      if (symbol.toUpperCase().indexOf(typed) > -1) {
        if(!obj.includes(symbol+":"+exchange+":"+stockName)){
          obj.push(symbol+":"+exchange+":"+stockName);
        }
      }
    }
    else if(typed.length==""){
      //Clear array when input is empty and hide elements
        obj = [];
        document.getElementsByClassName('searchUL')[0].style.visibility = 'hidden';
      }
      
  }
          let searchUL = document.getElementById("searchUL");
          document.getElementsByClassName('searchUL')[0].style.visibility = 'visible';
          //Cut Down the array containg similar stocks to top 5(JSON is sorted by Markett Cap Descending)
          const cutDown = obj.slice(0,5);
          let li ="";
          cutDown.forEach((item)=>{
                let myArray = item.split(":", 3);//Splits each array elements to grab relevant information
                let stockSymbol = myArray[0];
                let stockExchange = myArray[1];
                let stockname = myArray[2];
                if(stockExchange == "TSX"){
                  stockSymbol+=".TO";
                }
                li = document.createElement("li");
                li.className = "searchULli";
                li.innerHTML = "<a type='button' href='#' onclick='redirectCall(\""+stockSymbol+"\")'>" + item.substring(0, 30) + "</a>";
                searchUL.appendChild(li);
            });
});
  
}
/**
 * Abbreviates large numbers to letters
 * @param {number} number input number (large)
 * @param {number} decPlaces 
 * @returns {String} Converted number to string with letter assigned
 */
function abbrNum(number, decPlaces) {
  // 2 decimal places => 100, 3 => 1000, etc
  decPlaces = Math.pow(10, decPlaces);

  // Enumerate number abbreviations
  let abbrev = ["K", "M", "B", "T"];

  // Go through the array backwards, so we do the largest first
  for (let i = abbrev.length - 1; i >= 0; i--) {

    // Convert array index to "1000", "1000000", etc
    let size = Math.pow(10, (i + 1) * 3);

    // If the number is bigger or equal do the abbreviation
    if (size <= number) {
      // Here, we multiply by decPlaces, round, and then divide by decPlaces.
      // This gives us nice rounding to a particular decimal place.
      number = Math.round(number * decPlaces / size) / decPlaces;

      // Handle special case where we round up to the next abbreviation
      if ((number == 1000) && (i < abbrev.length - 1)) {
        number = 1;
        i++;
      }

      // Add the letter for the abbreviation
      number += abbrev[i];

      // We are done... stop
      break;
    }
  }

  return number;
}
