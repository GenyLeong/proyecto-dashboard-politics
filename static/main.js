document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll(".datepicker");
  var instances = M.Datepicker.init(elems);

  $.when(
    $.getJSON("ads-library-data"),
    $.getJSON("ads_expenses"),
    $.getJSON("count_per_candidate"),
    $.getJSON("tree_map_spend"),
    $.getJSON("perfil_expenses"),
    $.getJSON("funding_entity")
  ).then(function (
    [_line_comparative],
    [_ads_expenses],
    [count_per_candidate],
    [tree_map_spend],
    [perfil_expenses],
    [funding_entity]
  ) {
    // console.log([
    //   ...Object.keys(tree_map_spend["page_name"]).map((idx) => ({
    //     id: idx,
    //     name: tree_map_spend["page_name"][idx],
    //   })),
    //   ...Object.keys(tree_map_spend["Count"]).map((o) => ({
    //     name: tree_map_spend["page_name"][o],
    //     parent: o,
    //     value: tree_map_spend["Count"][o],
    //     color: "#9EDE00",
    //   })),
    // ]);
    Highcharts.chart("container_plot1", {
      chart: {
        type: "line",
      },
      title: {
        text: "Likes Crowdtangle",
      },
      // subtitle: {
      //   text: "Source: WorldClimate.com",
      // },
      xAxis: {
        type: "datetime",
        categories: Object.keys(_line_comparative["Arce"]).map((mmm) => {
          return parseInt(mmm);
        }),
      },
      // yAxis: {
      //   title: {
      //     text: "Temperature (°C)",
      //   },
      // },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true,
          },
          // enableMouseTracking: false,
        },
      },
      series: Object.keys(_line_comparative).map((candidateName) => {
        return {
          name: candidateName,
          data: Object.keys(_line_comparative[candidateName]).map(
            (key) => _line_comparative[candidateName][key]
          ),
          // data: Object.keys(count_per_candidate[c]).map((timestamp) => [
          //   parseInt(timestamp),
          //   count_per_candidate[c][timestamp],
          // ]),
        };
      }),
    });
    $("#total_ads").html(_ads_expenses["total_ads"]);
    $("#total_money").html(`$US ${_ads_expenses["spend_money"]}`);
    $("#political_parties").html(
      _ads_expenses["political_party"].map((name) => `<p>${name}</p>`)
    );

    Highcharts.chart("container_over_time", {
      chart: {
        zoomType: "x",
      },
      title: {
        text: "Ads count per candidate over time",
      },
      subtitle: {
        text:
          document.ontouchstart === undefined
            ? "Click and drag in the plot area to zoom in"
            : "Pinch the chart to zoom in",
      },
      xAxis: {
        type: "datetime",
        // categories: Object.keys(count_per_candidate["Carlos D. Mesa Gisbert"]).map(mmm => { return moment(parseInt(mmm)).date() })
      },
      yAxis: {
        title: {
          text: "Cantidad de anuncios",
        },
      },
      legend: {
        enabled: true,
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [
                1,
                Highcharts.color(Highcharts.getOptions().colors[0])
                  .setOpacity(0)
                  .get("rgba"),
              ],
            ],
          },
          marker: {
            radius: 2,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1,
            },
          },
          threshold: null,
        },
      },
      series: Object.keys(count_per_candidate).map((c) => ({
        name: c,
        type: "line",
        data: Object.keys(count_per_candidate[c]).map((timestamp) => [
          parseInt(timestamp),
          count_per_candidate[c][timestamp],
        ]),
      })),
    });

    Highcharts.chart("tree_map_spend", {
      plotOptions: {
        series: {
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.value}",
          },
        },
      },
      series: [
        {
          type: "treemap",
          layoutAlgorithm: "stripes",
          alternateStartingDirection: true,
          levels: [
            {
              level: 1,
              layoutAlgorithm: "sliceAndDice",
            },
          ],
          data: [
            ...Object.keys(tree_map_spend["page_name"]).map((idx) => ({
              id: idx,
              name: tree_map_spend["page_name"][idx],
              color: tree_map_spend["Colors"][idx],
            })),
            ...Object.keys(tree_map_spend["Count"]).map((o) => ({
              name: tree_map_spend["page_name"][o],
              parent: o,
              value: tree_map_spend["Count"][o],
            })),
          ],
        },
      ],
      title: {
        text: "Ads by Facebook Page, Spend by Ad",
      },
    });

    for (
      let index = 0;
      index < Object.keys(perfil_expenses["Count"]).length;
      index++
    ) {
      if (index != 1 && index != 2) {
        const element = perfil_expenses["Count"][index];
        // console.log(element);
        $("#candidate_" + index + " #total_ads_perfil").html(
          `<span>Total ads: </span> ${perfil_expenses["Count"][index]}`
        );
        $("#candidate_" + index + " #min_money_perfil").html(
          `<span>Gasto mínimo: </span> ${perfil_expenses["spend_min_USD"][index]}`
        );
        $("#candidate_" + index + " #max_money_perfil").html(
          `<span>Gasto máximo: </span> ${perfil_expenses["spend_max_USD"][index]}`
        );
      }
    }
    var colors_funding = [
      "#003f5c",
      "#58508d",
      "#bc5090",
      "#ff6361",
      "#ffa600",
    ];

    const reducer = (accumulator, currentValue) => {
      if (
        !accumulator.find(
          // (obj) => obj.id === currentValue.id && obj.name === currentValue.name
          (str) => str === currentValue
        )
      ) {
        accumulator.push(currentValue);
      }
      return accumulator;
    };

    var no_repeat = Object.values(funding_entity["page_name"]).reduce(
      reducer,
      []
    );
    console.log(funding_entity, no_repeat);
    // funding_entity["page_name"] = no_repeat;

    data = [
      ...no_repeat.map((candidate, i) => ({
        name: candidate,
        color: colors_funding[i],
        id: candidate,
      })),
      // ...Object.keys(funding_entity["page_name"]).map((idx, i) => ({
      //   name: funding_entity["page_name"][idx],
      //   color: colors_funding[i],
      //   id: funding_entity["page_name"][idx],
      // })),
      ...Object.keys(funding_entity["Count"]).map((key) => ({
        name: funding_entity["funding_entity"][key],
        parent: funding_entity["page_name"][key],
        value: funding_entity["Count"][key],
      })),
    ];

    Highcharts.chart("tree_map_funding", {
      plotOptions: {
        series: {
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.value}",
          },
        },
      },
      series: [
        {
          type: "treemap",
          layoutAlgorithm: "sliceAndDice",
          alternateStartingDirection: true,
          levels: [
            {
              level: 1,
              layoutAlgorithm: "sliceAndDice",
              dataLabels: {
                enabled: true,
                align: "center",
                verticalAlign: "top",
                style: {
                  fontSize: "14px",
                  fontWeight: "bold",
                },
              },
            },
          ],
          data: data,
        },
      ],
      title: {
        text: "Ads by Facebook Page, count by Funding Entity",
      },
    });
  });
});

$(document).ready(function () {
  $(".datepicker").datepicker();
});
