function getRandomIndex(length) { // get a random index from a sample
  return Math.floor(Math.random()*(length)); }

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
//If you don’t know your population mean (μ) but you do know the standard deviation (σ), you can find a confidence //interval for the population mean, with the formula:
//x̄ ± z* σ / (√n),
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
    var ciUpper = getPercent(array,alpha)
    var ciLower = getPercent(array,100-alpha)
    ci.push(ciLower,ciUpper)
    return ci
  }
