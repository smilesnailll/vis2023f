import define1 from "./a33468b95d0b15b0@817.js";

function _1(md){return(
md`# HW01 Strong Baseline`
)}

async function _data(FileAttachment)
{
  const data = await FileAttachment("data.csv").csv({typed: true});
  return data.columns.slice(5).flatMap((columns) => data.map((d) => ({
    index:d.序號,
    class:d.班級,
    id:d.學號,
    name: d.姓名,
    github: d.GitHub,
    columns,
    hw:d[columns]
  })));
}


function _4(Plot,data){return(
Plot.plot({
  width: 1000, height: 2000,
  x: {axis: "top", transform: (d) => d },
  color: {scheme: "Set3"},
  marks: [Plot.barX(data, {y: "name", x: "hw", fill: "hw"})]
})
)}

function _5(Plot,data){return(
Plot.plot({
  width: 1028, height: 500,
  color: {scheme: "Set2"},
  marks: [Plot.barY(data, {x: "name", y: "hw", fill: "hw"})],
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["data.csv", {url: new URL("../data.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  const child1 = runtime.module(define1);
  main.import("legend", child1);
  main.variable(observer()).define(["Plot","data"], _4);
  main.variable(observer()).define(["Plot","data"], _5);
  return main;
}
