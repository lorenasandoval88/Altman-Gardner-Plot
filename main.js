dataObj = {}
dataArr= []
// https://www.geeksforgeeks.org/how-to-read-a-local-text-file-using-javascript/
// Read local text file
document.getElementById('inputfile')
            .addEventListener('change', function() {
              
            var fr=new FileReader();
            fr.onload=function(e){
                document.getElementById('output')
                        .textContent=fr.result;
                    // push file data to array
                        dataArr.push(e.target.result) 
            }   
            fr.readAsText(this.files[0]); 
        })
// Get text input------------------------------------------------------------------

function getInputValue(){
    // Selecting the input element and get its value 
    var inputVal = document.getElementById("inputtext").value;
    var inputVal2 = document.getElementById("inputtext2").value;

    // Displaying the value
    dataObj.sample1 = inputVal
    dataObj.sample2 = inputVal2
    console.log(dataObj);
}
// Two samples ---------------------------------------
    var y1 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,1,2,3,4,5,6,7,8,9,10,11,12,13,4,1] // sample1
    var y2 = [1,2,3,4,5,6,7,8,9,10,22,22,13,20,19,1,2,3,4,5,6,7,8,9,10,22,22,13,20,20] // sample2
// get 300 bootstrapped difference of means
    var boot = bootstrappingMeanDiff(y1,y2,1000) 
// Get stats------------------------------------------------------------------
var div = document.getElementById('myDivStats');
div.innerHTML += "95% Confidence Interval of the difference of means: "
div.innerHTML += "<br>"
div.innerHTML += confidenceInterval2(boot ,2.5);
// Get data from file---------------------------------------------------------

// https://sebhastian.com/javascript-textbox/
// Read from text box

// // create label
// const label = document.createElement("label");
// label.setAttribute("for", "inputtext");
// label.innerHTML = "inputtext: ";

// // insert label
// document.body.appendChild(label);

// create textbox
//const input = document.createElement("input");
//input.setAttribute("id", "inputtext");
//input.setAttribute("type", "text");

// insert textbox
//document.body.appendChild(input);
//----------------------------------------------------------------------------

function getRandomIndex(length) { // get a random index from a sample
    return math.floor(math.random()*(length)); }
  
  function getRandomSample(array1) { // get a random sample with replacement
      var length = array1.length;
      var newArray = []
      for(var i = length; i--;) {
          var index = getRandomIndex(length);
          var temp = array1[index];
          newArray.push(temp);}
        return newArray}
    
    function bootstrappingMeanDiff(arr1, arr2, size){ // get 2*n sets of random samples and subtract each pair
    var meanDiffArray = []  
    for (var i = 0; i < size; i++) {
      // get the mean of sample 1 and 2
      var mean1 = math.mean(getRandomSample(arr1))
      var mean2 = math.mean(getRandomSample(arr2))
      var meanDiff = (math.abs(mean1-mean2)).toFixed(2)
        meanDiffArray.push(meanDiff)
      }
    return meanDiffArray
  }
  
    function getPercent(array, percent) {
      //return array.slice(0, Math.ceil(array.length * percent / 100));
        return array[(math.floor(array.length * percent / 100))-1];
  }
  //If you don???t know your population mean (??) but you do know the standard deviation (??), you can find a confidence //interval for the population mean, with the formula:
  //x?? ?? z* ?? / (???n),
    // function confidenceInterval(array,z){ // look up z: https://www.statisticshowto.com/tables/z-table/
    //   var ci = []
    //   var stdev = math.std(array)
    //   var ciUpper = math.mean(array)+((z*stdev)/math.sqrt(array.length))
    //   var ciLower = math.mean(array)-((z*stdev)/math.sqrt(array.length))
    //   ci.push(ciLower,ciUpper)
    //   return ci
    // }
      function confidenceInterval2(array,alpha){ // look up z: https://www.statisticshowto.com/tables/z-table/
      var ci = []
      var sortedArray = array.sort()
      var ciUpper = getPercent(sortedArray,alpha)
      var ciLower = getPercent(sortedArray,100-alpha)
      ci.push(ciLower,ciUpper)
      return ci
    }
 

  
    // Define plotly traces and layout
    var layout = {
      //xaxis: {rangemode: "tozero", showgrid: true, showspikes: true, spikethickness:8, tick0:8},
     legend: {
      x: 1.2,
      y: 1,
      traceorder: 'normal'
    },
      shapes: [ //https://plotly.com/javascript/shapes/
      { type: 'line',
        yref: 'y2',
        y0: math.mean(boot),
        y1: math.mean(boot),
        line: {color: 'black', width: 2}
      }],
    title: 'Altman-Gardner Plot in Plotly',
     yaxis: {title: 'Measurement', dtick: 5}, 
      // add a y-axis on the right side
    yaxis2: {
      showspikes: true, spikethickness:3, tick0:30, ticklen: 0,
       dtick: 5,
      showgrid: false,
      autorange: false,
      rangemode: 'tozero',
      range: [1,(math.mean(y1))],// (math.mean(y1))],
      scaleanchor: 'y', //https://github.com/plotly/plotly.js/issues/3539
      title: 'Unpaired Mean Difference',
      overlaying: 'y',
      side: 'right'
    },
  };
    var boxPlot1 = {
    y:y1,
    type: 'box',
    boxmean: 'sd',
    name: 'Group 1',
    jitter: 0.3,
    pointpos: -1.8,
    marker: {
      color: 'rgb(7,40,89)'
    },
    boxpoints: 'all'
  };
    var boxPlot2 = {
    y: y2,
    type: 'box',
    boxmean: 'sd',
    name: 'Group 2',
      jitter: 0.3,
    pointpos: -1.8,
    marker: {
      color: 'rgb(100,56,125)'
    },
    boxpoints: 'all'
  };
  
    var trace = {
      x: 2,
      y: boot,
      marker: {
        color: 'rgb(120, 120, 120)'
      },
      //spanmode: 'soft',
      yaxis: 'y2',
      type: 'violin',
      side: 'positive', //positive side means right for vertical violin plots
      name: 'Group 2 minus Group 1',
        hoveron: "points+kde",
    
    }
    
    var traceLine = {
    x: ['Group 2 minus Group 1'],
   y: [math.mean(boot)], // mean of distribution
      yaxis: 'y2',
    name: 'Group 2 minus Group 1',
    error_y: {
      type: 'data',
      symmetric: false,
      array: [confidenceInterval2(boot,2.5 )[0]],//confidenceInterval2(boot,2.5 ), // upper and lower confidence intervals
      arrayminus: [math.mean(boot)-confidenceInterval2(boot,2.5 )[1]],
      visible: true
    },
    type: 'markers'
  };
  var plotData = [ boxPlot1,boxPlot2,trace,traceLine];
  
  const myDiv = document.getElementById("myDiv");
  Plotly.newPlot(myDiv, plotData, layout);

  // for require-----------
  if(typeof(define)!='undefined'){
    //define({getRandomIndex:getRandomIndex})
    define({hello:"world"})
  }