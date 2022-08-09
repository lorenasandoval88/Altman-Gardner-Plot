console.log('usm2.js loaded')

usm = function(seq='acggctagagctag',abc){
    if(typeof(seq)=='object'){
        Object.assign(this,seq)
    }else{
        this.seq=seq
    }
    abc=abc||usm.unique(this.seq).sort() // note sort if undefined
    if(typeof(abc)=="string"){
        abc=abc.split('')
    }
    this.edges=usm.edges(abc)
    usm.iterate(this)
    this.canvas=function(size=200,direction="forward",that=this,){
        return usm.canvasGray(that,size,direction)
    }
    this.fcgr=function(size=2**4,direction="forward",that=this){
        return usm.fcgr(that,size,direction)
    }
    this.plotCanvas=function(size=200,direction="forward",that=this,){
        return usm.plotCanvas(that,size,direction)
    }
    this.plotPoints=function(size=200,direction="forward",that=this,){
        return usm.plotPoints(that,size,direction)
    }
    this.plotlyPoints=function(size=500,direction="forward",that=this,){
        return usm.plotlyPoints(that,size,direction)
    }
    this.plotlyPoints3d=function(size=500,that=this,){
        return usm.plotlyPoints3d(that,size)
    }
    this.plotlyRibon=function(size=500,that=this,){
        return usm.plotlyRibon(that,size)
    }
    this.plot=function(size=200,direction="forward",cutoff=1000,that=this){
        if(that.seq.length<cutoff){ // vectorized sequences for smaller sequences
            return usm.plotPoints(that,size,direction)
        }else{
            return usm.plotCanvas(that,size,direction)
        }      
    }
}

usm.resolveSeq=async function(seq){
    let res={seq:seq}
    if(seq.match(/^http[s]*:\/\//)){ // if it is a url
        res.url=seq
        res.seq = await (await fetch(seq)).text()
    }
    if(res.seq.match(/^>[^\n\r]*/)){ // if fastA
        res.name = res.seq.match(/^>[^\n\r]*/)[0]
        res.seq=res.seq.replace(/^>[^\n\r]*/,'').replace(/[\n\r]/g,'')
    }
    return res
}

usm.unique=seq=>[...new Set(seq)]

usm.rep=(v=0,n=2)=>[...new Array(n)].map(_=>v) // replicate v n times

usm.range=((n,i0=0,d=1)=>[...Array(n)].map((_,i)=>i*d+i0)) // array with n numbers at d intervals starting with i0 

usm.int2bin=(v,n=Math.floor(Math.log2(v))+1)=>{ // integer to binary as an array of length n
    let bb=usm.rep(0,n)
    for(var i in bb){
        let k = 2**(n-i-1)
        if(v>=k){
            bb[i]=1
            v-=k
        }
    }
    return bb
}

usm.edges=ab=>{ // calculate compact edges of an alphabet
    const n = Math.ceil(Math.log2(ab.length)) // dimensions needed for compact notation
    //const m = ab.length // alphabet length
    const edges={}
    ab.forEach((a,i)=>{
        edges[a]=usm.int2bin(i,n)
        if(edges[a].length==0){
            edges[a]=[0]
        }
    })
    return edges //usm.range(m).map(v=>usm.int2bin(v,n))
}

usm.iterate=(u)=>{
    u.forward=[]
    u.backward=[]
    const n=u.seq.length
    u.edges[Object.keys(u.edges)[0]].forEach((_,d)=>{ // for each dimension
        console.log(`iterating dimension ${d}`)
        u.forward[d]=usm.rep(0.5,n)
        u.backward[d]=usm.rep(0.5,n)
        let funForward = function(m=n){
            u.forward[d][0]=u.backward[d][0]+(u.edges[u.seq[0]][d]-u.backward[d][0])/2
            for(let i=1 ; i<m ; i++){
                u.forward[d][i]=u.forward[d][i-1]+(u.edges[u.seq[i]][d]-u.forward[d][i-1])/2
            }    
        }
        let funBackward = function (){
            u.backward[d][n-1]=u.forward[d][n-1]+(u.edges[u.seq[n-1]][d]-u.forward[d][n-1])/2
            for(let i=n-2 ; i>=0 ; i--){
                u.backward[d][i]=u.backward[d][i+1]+(u.edges[u.seq[i]][d]-u.backward[d][i+1])/2
            }    
        }
        funForward()
        funBackward()
        // close seeding circularity
        funForward( n>100 ? 100 : n )
        const L = Math.floor(100/n)
        if(L>0&d==0){console.log(`short sequence, looped ${L} times`)}
        for(let k=0 ; k < 100/n ; k++){
            //console.log(`short sequence, looping ${k}`)
            funBackward()
            funForward()
        }
    })
    return u
}

usm.canvas=function(u,size=200,direction="forward"){
    let cv = document.createElement('canvas')
    cv.width=cv.height=size
    cv.style.border="1px solid black"
    let ctx = cv.getContext('2d')
    ctx.fillStyle = 'rgb(255, 255, 255)'
    ctx.fillRect(0,0,size,size) // white background
    ctx.fillStyle = 'rgb(0, 0, 0)' // black map points
    let xy=u[direction]
    xy[0].forEach((_,i)=>{
        ctx.fillRect(Math.floor(xy[0][i]*size), Math.floor(xy[1][i]*size), 1, 1);
        //debugger
    })
    //debugger
    return cv
}

usm.fcgr=function(u,size=2**4,direction="forward"){
    let fcgr = [...Array(size)].map(_=>([...Array(size)].map(_=>0))) // FCGR
    let xy=u[direction]
    xy[0].forEach((_,i)=>{ // count FCGR
        let x=Math.floor(xy[0][i]*size)
        let y=Math.floor(xy[1][i]*size)
        fcgr[x][y]+=1
    })
    return fcgr
}

usm.canvasGray=function(u,size=200,direction="forward"){
    size=Math.round(size) // just in case
    let cv = document.createElement('canvas')
    cv.width=cv.height=size
    cv.style.border="1px solid black"
    let ctx = cv.getContext('2d')
    ctx.fillStyle = 'rgb(255, 255, 255)' // white
    ctx.fillRect(0,0,size,size) // white background
    let fcgr = [...Array(size)].map(_=>([...Array(size)].map(_=>0))) // FCGR
    let xy=u[direction]
    xy[0].forEach((_,i)=>{ // count FCGR
        let x=Math.floor(xy[0][i]*size)
        let y=Math.floor(xy[1][i]*size)
        fcgr[x][y]+=1
    })
    let fcgrMax = Math.log(fcgr.map(c=>c.reduce(r=>Math.max(r))).reduce(s=>Math.max(s))+1)
    fcgr.map((c,j)=>c.forEach((r,i)=>{
        let val = 255-(Math.round(255*Math.log(fcgr[j][i]+1)/fcgrMax))
        ctx.fillStyle = `rgb(${val},${val},${val})` // black map points
        ctx.fillRect(size-i, size-j, 1, 1);
    }))
    return cv
}


usm.canvasColor=function(u,size=200,direction="forward"){
    size=Math.round(size) // just in case
    let cv = document.createElement('canvas')
    cv.width=cv.height=size
    cv.style.border="1px solid black"
    let ctx = cv.getContext('2d')
    ctx.fillStyle = 'rgb(255, 255, 255)' // white
    ctx.fillRect(0,0,size,size) // white background
    let fcgr = [...Array(size)].map(_=>([...Array(size)].map(_=>0))) // FCGR
    let xy=u[direction]
    xy[0].forEach((_,i)=>{ // count FCGR
        let x=Math.floor(xy[0][i]*size)
        let y=Math.floor(xy[1][i]*size)
        fcgr[x][y]+=1
    })
    let fcgrMax = Math.log(fcgr.map(c=>c.reduce(r=>Math.max(r))).reduce(s=>Math.max(s))+1)
    fcgr.map((c,j)=>c.forEach((r,i)=>{
        let val = (Math.round(255*Math.log(fcgr[j][i]+1)/fcgrMax))
        ctx.fillStyle = `rgb(${val},${val},${255-val})` // black map points
        ctx.fillRect(size-i, size-j, 1, 1);
    }))
    return cv
}


usm.plotCanvas=function(u,size=200,direction="forward"){
    size=Math.round(size) // just in case
    let spc = 15 // marginal space
    let sg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sg.setAttribute('width',size+2*spc+2)
    sg.setAttribute('height',size+2*spc+2)
    let fobj = document.createElementNS('http://www.w3.org/2000/svg','foreignObject')
    fobj.setAttribute("x",spc-1)
    fobj.setAttribute("y",spc-1)
    fobj.setAttribute("width",size+2)
    fobj.setAttribute("height",size+2)
    sg.appendChild(fobj)
    let cv = u.canvas(size,direction)
    fobj.appendChild(cv)
    // edge labels
    Object.keys(u.edges).forEach((edj,i)=>{
        let txt = document.createElementNS('http://www.w3.org/2000/svg','text')
        let x = u.edges[edj][0] //(u.edges[edj][0])*(size+spc+1)+10
        let y = u.edges[edj][1]//(u.edges[edj][1])*(size+spc+1)+10
        if(x*y){
            x=size+spc+2;
            y=size+spc*2-1;
        } else {
            if(x){
                x=size+spc+2
                y=spc-1
            }else if(y){
                x=2
                y=size+spc*2-1
            }else{
                x=2
                y=spc-1
            }
        }
        txt.setAttribute("x",x)
        txt.setAttribute("y",y)
        txt.textContent=edj
        txt.style.alignContent='left'
        //txt.style.verticalAlign="top"
        sg.appendChild(txt)
    })
    return sg
}

usm.insertMerge=function(x,x2,m=1){ //insert undefined every m values, or merge with contents of a second array
    // try, for example:
    // usm.insertMerge([0,1,2,3,4,5,6,7],['a','b','c','d','e','f','g','h'],2)
    // usm.insertMerge([0,1,2,3,4,5,6,7],3)
    // usm.insertMerge([0,1,2,3,4,5,6,7])
    let x2Exists=(typeof(x2)!='undefined')
    if(typeof(x2)=='number'){
        x2Exists=false
        m=x2
    }
    const n = x.length
    let y = []
    let i=0
    while(i<n){
        y=y.concat(x.slice(i,i+m))
        if(x2Exists){
            y=y.concat(x2.slice(i,i+m))
        }else{
            y.push(undefined)
        }
        i+=m
    }
    // trailing blank
    if(typeof(y.slice(-1)[0])=='undefined'){
        y=y.slice(0,-1)
    }
    /*
    for(var i=0;i<n;i++){
        y.push(x[i])
        if((i%m===0)){
            if(x2Exists){
                for(var j=i;j-i<m;j++){
                    y.push(x2[j])
                }
            }else{
                y.push(undefined)    
            }
        }
    }
    */
    return y
}

usm.plotPoints=function(u,size=200,direction="forward"){
    size=Math.round(size) // just in case
    let sg = u.plotCanvas(size,direction)
    let spc = 15 // marginal space
    function circle(x=20,y=20,r=10,c="navy",w=1,fill="yellow",opacity=0.5){
        let cc = document.createElementNS('http://www.w3.org/2000/svg','circle')
        cc.setAttribute("cx",x)
        cc.setAttribute("cy",y)
        cc.setAttribute("r",r)
        cc.setAttribute("stroke",c)
        cc.setAttribute("stroke-width",w)
        cc.setAttribute("fill",fill)
        cc.setAttribute("fill-opacity",opacity)
        sg.appendChild(cc)
    }
    let xy=u[direction]
    xy[0].forEach((_,i)=>{
        if(i>0){ //link points
            if(i<(xy[0].length-1)){
                circle(Math.floor(xy[0][i]*size+spc+1), Math.floor(xy[1][i]*size+spc+1),5)
            }else{
                circle(Math.floor(xy[0][i]*size+spc+1), Math.floor(xy[1][i]*size+spc+1),5,"maroon",1,"red",0.3)
            }
            
            let ln = document.createElementNS('http://www.w3.org/2000/svg','line')
            ln.setAttribute("x1",Math.floor(xy[0][i-1]*size+spc+1))
            ln.setAttribute("y1",Math.floor(xy[1][i-1]*size+spc+1))
            ln.setAttribute("x2",Math.floor(xy[0][i]*size+spc+1))
            ln.setAttribute("y2",Math.floor(xy[1][i]*size+spc+1))
            ln.setAttribute("stroke","silver")
            sg.appendChild(ln)
            // <line x1="0" y1="80" x2="100" y2="20" stroke="black" />
        }else{
            circle(Math.floor(xy[0][i]*size+spc+1), Math.floor(xy[1][i]*size+spc+1),5,"maroon",1,"lime",1)
        }
    })
    //*/
    return sg
}

usm.plotlyPoints=function(u,size=500,direction='forward'){
    let trace = {
        x:u[direction][1],
        y:u[direction][0],
        mode: 'lines+markers',
        type: 'scatter',
        line:{
            width:1,
            color:'silver'
        },
        marker:{
            color:'rgba(255,255,0,0.5)',
            line:{
                color:'navy',
                width:1
            },
            size:10
        },
        showlegend: false
    }
    let gridTrace={
        x:[1/4,1/4,undefined,1/2,1/2,undefined,3/4,3/4,undefined,0,1,undefined,0,1,undefined,0,1],
        y:[0,1,undefined,0,1,undefined,0,1,undefined,1/4,1/4,undefined,1/2,1/2,undefined,3/4,3/4],
        showlegend: false,
        mode:'lines',
        type:'scatter',
        line:{
            color:'silver',
        }
    }
    let gridCross={
        y:[1/2,1/2,undefined,0,1],
        x:[0,1,undefined,1/2,1/2],
        showlegend: false,
        mode:'lines',
        type:'scatter',
        line:{
            color:'gray',
        }
    }
    //let edges={
    //    x:[-0.01,0,1,1],
    //    y:[-0.01,1,0,1],
    //    mode:'text',
    //    text:['A','C','G','T'],
    //    showlegend: false
    //}
    let traces = [gridTrace,gridCross,trace]
    let layout = {
        title:`USM ${direction} coordinates`,
        xaxis: {
            range: [0, 1],
            linecolor: 'black',
            linewidth: 1,
            mirror: 'all',
            ticks: 'outside',
            tick0: 0,
            tickvals:[...Array(17)].map((_,i)=>i/16),
            ticktext:['0','','','','1/4','','','','1/2','','','','3/4','','','','1']
          },
        yaxis: {
            range: [0, 1],
            linecolor: 'black',
            linewidth: 1,
            ticks: 'outside',
            tick0: 0,
            mirror: 'all',
            tickvals:[...Array(17)].map((_,i)=>i/16),
            ticktext:['0','','','','1/4','','','','1/2','','','','3/4','','','','1']
        },
        margin: {
            pad: 0
        },
        //plot_bgcolor: 'rgba(0,0,0,0)',
        //paper_bgcolor: 'rgba(0,0,0,0)',
        annotations:[
            {x:0,y:0,ax:-15,ay:15,text:'A',font:{size: 16}},
            {x:0,y:1,ax:-15,ay:-15,text:'G',font:{size: 16}},
            {x:1,y:1,ax:15,ay:-15,text:'T',font:{size: 16}},
            {x:1,y:0,ax:15,ay:15,text:'C',font:{size: 16}}
        ],
        width:size,
        height:size
    }
    let div = document.createElement('div')
    usm.Plotly.newPlot(div,traces,layout)
    //debugger
    return div
}
usm.plotlyPoints3d=function(u,size=500){ // 3d plot of forward and backward coordinates
    let n = u.forward[0].length
    let traceF={
        x:u.forward[0],
        y:u.forward[1],
        z:[...Array(10)].map(a=>0),
        'name':'forward',
        mode: 'lines+markers',
        type: 'scatter3d',
        marker:{
            color:'green',
            size:6,
            opacity:0.5
        },
        line:{
            width:0.5
        }
    }
    let traceB={
        x:u.backward[0],
        z:u.backward[1],
        y:[...Array(10)].map(a=>0),
        'name':'backward',
        mode: 'lines+markers',
        type: 'scatter3d',
        marker:{
            color:'red',
            size:6,
            opacity:0.3
        },
        line:{
            width:0.5
        }
    }
    let trace3D={
        x:u.forward[0],
        y:u.forward[1],
        z:u.backward[1],
        showlegend: false,
        mode: 'lines+markers',
        type: 'scatter3d',
    }
    let trace3DF={
        x:u.forward[0],
        y:u.forward[1],
        z:u.forward[1],
        showlegend: false,
        mode: 'lines+markers',
        type: 'scatter3d',
        marker:{
           color:'green',
           size:6,
           opacity:1
        }
    }
    let trace3DB={
        x:u.backward[0],
        y:u.backward[1],
        z:u.backward[1],
        showlegend: false,
        mode: 'lines+markers',
        type: 'scatter3d',
        marker:{
           color:'red',
           size:6,
           opacity:1
        }
    }
    let xyz=[]
    let rods={
        x:usm.insertMerge(usm.insertMerge(u.forward[0],u.backward[0]),2),
        y:usm.insertMerge(usm.insertMerge(u.forward[1],u.backward[1]),2),
        z:usm.insertMerge(usm.insertMerge(u.forward[1],u.backward[1]),2),
        //x:(usm.insertMerge(u.backward[0],u.forward[0])),
        //y:(usm.insertMerge(u.backward[1],u.forward[1])),
        //z:(usm.insertMerge(u.backward[1],u.forward[1])),
        //z:[...Array(n*2)].map(_=>0),
        mode:'lines+markers',
        type: 'scatter3d',
        marker:{
            showlegend:false,
            color:'blue',
            opacity:0.2,
            size:20
        },
        line:{
            width:4,
            opacity:0.3
                
        }
    }
    
    function sleeve(rods){
        let x=rods.x.filter(v=>v)
        let y=rods.y.filter(v=>v)
        let z=rods.z.filter(v=>v)
        return {
            type:'mesh3d',
            x:x,
            y:y,
            z:z,
        }
        debugger
    }
    
    function cube(x=0,y=0,z=0,dx=1,dy=1,dz=1,op=0.3){
        var facecolor = [
        	`rgba(255, 0, 0, ${op})`,
        	`rgba(0, 255, 250, ${op})`,
        	`rgba(0, 200, 0, 0)`,//${op})`,
        	`rgba(200, 200, 50, 0)`,//${op})`,
        	`rgba(230, 20, 200, 0)`,//${op})`,
        	`rgba(255, 140, 0, 0)`,//${op})`
        ]
        facecolor2 = new Array(facecolor.length * 2);
        facecolor.forEach(function(x, i) {
        	facecolor2[i * 2 + 1] = facecolor2[i * 2] = x;
        });
        return {
            type: 'mesh3d',
            facecolor:facecolor2,
            x:[x,x,x+dx,x+dx,x,x,x+dx,x+dx],
            y:[y,y+dy,y+dy,y,y,y+dy,y+dy,y],
            z:[z,z,z,z,z+dz,z+dz,z+dz,z+dz],
            i:[7, 0, 0, 0, 4, 4, 2, 6, 4, 0, 3, 7],
            j:[3, 4, 1, 2, 5, 6, 5, 5, 0, 1, 2, 2],
            k:[0, 7, 2, 3, 6, 7, 1, 2, 5, 5, 7, 6]
        }
    }
    let traces=[traceF,traceB,trace3DF,trace3DB,rods,cube(),sleeve(rods)] //,trace3D]
    /*
    for(var i=0;i<n;i++){
        traces.push({
            opacity:0.8,
            color:'rgb(300,100,200)',
            type: 'mesh3d',
            x: [u.forward[1][i],Math.random(),Math.random()],
            y: [Math.random(),Math.random(),Math.random()],
            z: [Math.random(),Math.random(),Math.random()]
        })
    }
    */
    
    let layout = {
        title:`USM 3D`,
        width: size,
        height: size,
        xaxis: {
            range: [0, 1]
        },
        yaxis: {
            range: [0, 1]
        },
        zaxis: {
            range: [0, 1]
        }
    }
    //let traces=[traceF,traceB,trace3DF,trace3DB,rods,cube(),sleeve(rods)] 
    let div = document.createElement('div')
    usm.Plotly.newPlot(div,traces,layout)
    return div
    
}

usm.cube=function(x=0,y=0,z=0,dx=1,dy=1,dz=1,op=0.3,
    facecolor = [
        `rgba(255, 0, 0, ${op})`,
        `rgba(0, 255, 250, ${op})`,
        `rgba(0, 200, 0, 0)`,//${op})`,
        `rgba(200, 200, 50, 0)`,//${op})`,
        `rgba(230, 20, 200, 0)`,//${op})`,
        `rgba(255, 140, 0, 0)`,//${op})`
    ]){
    facecolor2 = new Array(facecolor.length * 2);
    facecolor.forEach(function(x, i) {
        facecolor2[i * 2 + 1] = facecolor2[i * 2] = x;
    });
    return {
        type: 'mesh3d',
        facecolor:facecolor2,
        x:[x,x,x+dx,x+dx,x,x,x+dx,x+dx],
        y:[y,y+dy,y+dy,y,y,y+dy,y+dy,y],
        z:[z,z,z,z,z+dz,z+dz,z+dz,z+dz],
        i:[7, 0, 0, 0, 4, 4, 2, 6, 4, 0, 3, 7],
        j:[3, 4, 1, 2, 5, 6, 5, 5, 0, 1, 2, 2],
        k:[0, 7, 2, 3, 6, 7, 1, 2, 5, 5, 7, 6]
    }
}

usm.plotlyRibon=function(u,size=500){

    let n = u.forward[0].length
    let traceF={
        x:u.forward[0],
        y:u.forward[1],
        z:[...Array(10)].map(a=>0),
        'name':'forward',
        mode: 'lines+markers',
        type: 'scatter3d',
        marker:{
            color:'green',
            size:6,
            opacity:0.5
        },
        line:{
            width:0.5
        }
    }
    let traceB={
        x:u.backward[0],
        z:u.backward[1],
        y:[...Array(10)].map(a=>0),
        'name':'backward',
        mode: 'lines+markers',
        type: 'scatter3d',
        marker:{
            color:'red',
            size:6,
            opacity:0.3
        },
        line:{
            width:0.5
        }
    }
    let trace3D={
        x:u.forward[0],
        y:u.forward[1],
        z:u.backward[1],
        showlegend: false,
        mode: 'lines+markers',
        type: 'scatter3d',
    }
    let trace3DF={
        x:u.forward[0],
        y:u.forward[1],
        z:u.forward[1],
        showlegend: false,
        mode: 'lines+markers',
        type: 'scatter3d',
        marker:{
           color:'green',
           size:6,
           opacity:1
        }
    }
    let trace3DB={
        x:u.backward[0],
        y:u.backward[1],
        z:u.backward[1],
        showlegend: false,
        mode: 'lines+markers',
        type: 'scatter3d',
        marker:{
           color:'red',
           size:6,
           opacity:1
        }
    }
    let xyz=[]
    let rods={
        x:usm.insertMerge(usm.insertMerge(u.forward[0],u.backward[0]),2),
        y:usm.insertMerge(usm.insertMerge(u.forward[1],u.backward[1]),2),
        z:usm.insertMerge(usm.insertMerge(u.forward[1],u.backward[1]),2),
        //x:(usm.insertMerge(u.backward[0],u.forward[0])),
        //y:(usm.insertMerge(u.backward[1],u.forward[1])),
        //z:(usm.insertMerge(u.backward[1],u.forward[1])),
        //z:[...Array(n*2)].map(_=>0),
        mode:'lines+markers',
        type: 'scatter3d',
        marker:{
            showlegend:false,
            color:'blue',
            opacity:0.2,
            size:20
        },
        line:{
            width:4,
            opacity:0.3
                
        }
    }
    let div = document.createElement('div')
    function sleeve(rods){
        let x=rods.x.filter(v=>v)
        let y=rods.y.filter(v=>v)
        let z=rods.z.filter(v=>v)
        return {
            type:'mesh3d',
            x:x,
            y:y,
            z:z,
        }
        debugger
    }
    let traces=[traceF,traceB,trace3DF,trace3DB,rods,usm.cube(),sleeve(rods)]
    let layout = {
        title:`USM 3D`,
        width: size,
        height: size,
        xaxis: {
            range: [0, 1]
        },
        yaxis: {
            range: [0, 1]
        },
        zaxis: {
            range: [0, 1]
        }
    }
    usm.Plotly.newPlot(div,traces,layout)
    return div
}

usm.plotlyCompare=function(u1,u2,size=500){
    if(typeof(u1)=='string'){
        u1=new usm(u1)
    }
    if(typeof(u2)=='string'){
        u2=new usm(u2)
    }
    let div = document.createElement('div')
    //debugger
    return div
}

// --------------------//

//u = new usm()

if(typeof (define) != 'undefined'){   
    define(['https://cdn.plot.ly/plotly-2.12.1.min.js'],function(Plotly){
        usm.Plotly=Plotly
        return usm
    })
}
