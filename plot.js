console.log('plot.js loaded')

stat = function(array){
        Object.assign(array)
    }

stat.getRandomIndex =  (length) =>  { // get a random index from a sample
    return Math.floor(Math.random()*(length)); }
  
stat.getRandomSample = (array1)  => { // get a random sample with replacement
      var length = array1.length;
      var newArray = []
      for(var i = length; i--;) {
          var index = getRandomIndex(length);
          var temp = array1[index];
          newArray.push(temp);}
        return newArray}
    
stat.bootstrappingMeanDiff = (arr1, arr2, size) => { // get 2*n sets of random samples and subtract each pair
    var meanDiffArray = []  
    for (var i = 0; i < size; i++) {
      // get the mean of sample 1 and 2
      var mean1 = Math.mean(getRandomSample(arr1))
      var mean2 = Math.mean(getRandomSample(arr2))
      var meanDiff = (Math.abs(mean1-mean2)).toFixed(2)
        meanDiffArray.push(meanDiff)
      }
    return meanDiffArray
  }
  
  stat.getPercent = (array, percent) => {
      //return array.slice(0, Math.ceil(array.length * percent / 100));
        return array[(Math.floor(array.length * percent / 100))-1];
  }
  //If you don’t know your population mean (μ) but you do know the standard deviation (σ), you can find a confidence //interval for the population mean, with the formula:
  //x̄ ± z* σ / (√n),
    // function confidenceInterval(array,z){ // look up z: https://www.statisticshowto.com/tables/z-table/
    //   var ci = []
    //   var stdev = Math.std(array)
    //   var ciUpper = Math.mean(array)+((z*stdev)/Math.sqrt(array.length))
    //   var ciLower = Math.mean(array)-((z*stdev)/Math.sqrt(array.length))
    //   ci.push(ciLower,ciUpper)
    //   return ci
    // }
stat.confidenceInterval2 = (array,alpha) => { // look up z: https://www.statisticshowto.com/tables/z-table/
      var ci = []
      var sortedArray = array.sort()
      var ciUpper = getPercent(array,alpha)
      var ciLower = getPercent(array,100-alpha)
      ci.push(ciLower,ciUpper)
      return ci
    }

if(typeof(define)!='undefined'){
    define(['https://cdnjs.cloudflare.com/ajax/libs/mathjs/3.3.0/math.min.js'],function(Math){
        stat.Math = Math
        return stat
    })  
}