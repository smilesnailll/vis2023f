function _1(md){return(
md`# HW04 Strong Baseline`
)}

function _artist(FileAttachment){return(
FileAttachment("artist.csv").csv()
)}

function _innerCircleQuestion(artist){return(
Object.keys(artist[0])[4]
)}

function _outerCircleQuestion(artist){return(
Object.keys(artist[0])[18]
)}

function _data(artist,innerCircleQuestion,outerCircleQuestion)
{
  // 提取內外圈問題的答案
  var innerCircleAnswer = artist.map(row => row[innerCircleQuestion]);
  var outerCircleAnswer = artist.map(row => row[outerCircleQuestion]);

  // 將內外圈答案結合，形成新的答案陣列
  var combinedAnswers = innerCircleAnswer.map((innerAns, index) => [innerAns, outerCircleAnswer[index]]);

  // 重新格式化答案，將其轉換為符合特定模式的陣列
  var reformattedAnswers = combinedAnswers.map(item => {
    const [innerAns, outerAns] = item;
    const splitOuterAns = outerAns.split(';').map(value => value.trim());
    return splitOuterAns.map(outerValue => [innerAns, outerValue]);
  }).reduce((acc, curr) => acc.concat(curr), []);

  // 計算每個重新格式化答案的出現次數
  var answerCounts = {};
  reformattedAnswers.forEach(reformattedAns => {
    const key = reformattedAns.join('-');
    answerCounts[key] = (answerCounts[key] || 0) + 1;
  });

  // 轉換為CSV格式的數據
  var csvData = Object.entries(answerCounts).map(([answer, count]) => {
    const [innerQuestion, outerQuestion] = answer.split('-');
    return [innerQuestion, outerQuestion, String(count)];
  });

  // 建立包含層次結構的數據
  return csvData;
}


function _chart(d3,data)
{
  // Specify the chart’s dimensions.
  const width = 928;
  const height = width;
  const marginTop = 30;
  const marginRight = -1;
  const marginBottom = -1;
  const marginLeft = 1;

  // Create the color scale.
  // 假設csvData的結構是 [內圈問題, 外圈問題, 次數]
  // 需要據此調整顏色比例尺的domain
  const color = d3.scaleOrdinal(d3.schemeSet3).domain(data.map(d => d.segment));

  // Compute the layout.
  // 調整treemap以適應csvData的結構
  const treemap = data => d3.treemap()
      .round(true)
      .tile(d3.treemapSliceDice)
      .size([
        width - marginLeft - marginRight, 
        height - marginTop - marginBottom
      ])
    (d3.hierarchy(d3.group(data, d => d[0], d => d[1])).sum(d => +d[2]))
    .each(d => {
      d.x0 += marginLeft;
      d.x1 += marginLeft;
      d.y0 += marginTop;
      d.y1 += marginTop;
    });
  const root = treemap(data);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 90%; height: auto; font: 12px sans-serif;");


  // Position the nodes.
  const node = svg.selectAll("g")
    .data(root.descendants())
    .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

  const format = d => d.toLocaleString();

  // Draw column labels.
  const column = node.filter(d => d.depth === 1);

  
  
  column.append("text")
      .attr("x", 3)
      .attr("y", "-1.7em")
      .style("font-weight", "bold")
      .text(d => d.data[0]);

  column.append("text")
      .attr("x", 3)
      .attr("y", "-0.5em")
      .attr("fill-opacity", 0.7)
      .text(d => format(d.value));

  column.append("line")
      .attr("x1", -0.5)
      .attr("x2", -0.5)
      .attr("y1", -30)
      .attr("y2", d => d.y1 - d.y0)
      .attr("stroke", "#000")

  // Draw leaves.
  const cell = node.filter(d => d.depth === 2);
  
  cell.append("rect")
      .attr("fill", d => color(d.data[0]))
      .attr("fill-opacity", (d, i) => d.value / d.parent.value)
      .attr("width", d => d.x1 - d.x0 - 1)
      .attr("height", d => d.y1 - d.y0 - 1)

  cell.append("text")
      .attr("x", 3)
      .attr("y", "1.1em")
      .text(d => {
            if(d.data[0] === "不清楚，需要更多資訊。") {
              return "不清楚";
            }
            return d.data[0];
          });
      // .text(d => d.data[0]);

  cell.append("text")
      .attr("x", 3)
      .attr("y", "2.3em")
      .attr("fill-opacity", 0.7)
      .text(d => format(d.value));

  // ------------------------------------------------------
  cell.on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

  cell.append("rect")
      .attr("fill", d => color(d.data[0]))
      .attr("fill-opacity", (d, i) => d.value / d.parent.value)
      .attr("width", d => d.x1 - d.x0 - 1)
      .attr("height", d => d.y1 - d.y0 - 1);
  
  cell.append("text")
      .attr("x", 3)
      .attr("y", "1.1em")
      .text(d => {
          if(d.data[0] === "不清楚，需要更多資訊。") {
              return "不清楚";
          }
          return d.data[0];
      });
  
  cell.append("text")
      .attr("x", 3)
      .attr("y", "2.3em")
      .attr("fill-opacity", 0.7)
      .text(d => format(d.value));
  
  // 定義滑鼠懸停事件處理函數
  function handleMouseOver(event, d) {
    // 在這裡定義滑鼠懸停時的行為

    // 顯示相關信息
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);

    tooltip.html(`Category: ${d.data[0]}<br>Value: ${format(d.value)}`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");

    // 放大元素
    d3.select(event.target)
        .transition()
        .duration(200)
        .attr("transform", "scale(0.8)");

    // 突顯元素
    d3.select(event.target)
        .attr("stroke", "#586D80")
        .attr("stroke-width", 2);
}

function handleMouseOut(event, d) {
    // 在這裡定義滑鼠離開時的行為

    // 隱藏相關信息
    d3.select(".tooltip")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();

    // 還原元素狀態
    d3.select(event.target)
        .transition()
        .duration(200)
        .attr("transform", "scale(1)")
        .attr("stroke", "none");
}
  return svg.node();
}


function _height(){return(
500
)}

function _radius(){return(
6
)}

function _step(radius){return(
radius * 2
)}

function _10(md){return(
md`<h2>結論</h2>
<h3>從上圖中，我們可以看出：
  <ul>
    <li>受訪民眾對於聯合國永續發展目標（SDGs）的瞭解大多不高</li>
    <li>認為藝文獎補助與採購，要求申請者揭露碳排放報告，會提升民意機關和民眾的藝文支持度的民眾佔多數</li>
  </ul>
</h3>`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["artist.csv", {url: new URL("./files/artist.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("artist")).define("artist", ["FileAttachment"], _artist);
  main.variable(observer("innerCircleQuestion")).define("innerCircleQuestion", ["artist"], _innerCircleQuestion);
  main.variable(observer("outerCircleQuestion")).define("outerCircleQuestion", ["artist"], _outerCircleQuestion);
  main.variable(observer("data")).define("data", ["artist","innerCircleQuestion","outerCircleQuestion"], _data);
  main.variable(observer("chart")).define("chart", ["d3","data"], _chart);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("radius")).define("radius", _radius);
  main.variable(observer("step")).define("step", ["radius"], _step);
  main.variable(observer()).define(["md"], _10);
  return main;
}
