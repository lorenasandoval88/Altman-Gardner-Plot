async function loadScript(url) {
    let load = new Promise((resolve, reject) => {
        let s = document.createElement('script');
        s.src = url;
        s.onload = resolve;
        document.head.appendChild(s);
    });
    return load
};

//await loadScript("http://localhost:8000/usm2/usm2.js");
await loadScript("https://usm.github.io/2/usm2.js");
await loadScript("https://cdn.plot.ly/plotly-2.12.1.min.js");


const usm2=usm
usm2.Plotly=Plotly

export {
    usm2
}
