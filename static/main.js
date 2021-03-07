document.addEventListener("DOMContentLoaded", function () {
  // Spanish overwrite
  inter_es = {
    cancel: "Cancelar",
    done: "Ok",
    months: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    monthsShort: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    weekdays: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ],
    weekdaysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    weekdaysAbbrev: ["D", "L", "M", "M", "J", "V", "S"],
  };

  // Create default dates
  var date = new Date(2020, 7, 3, 00, 00, 00);
  // set default date f or #from (1 week from today)
  var nextWeekFrom = new Date(date.setDate(date.getDate()));
  // Default date for #to
  var nextWeekTo = new Date(date.setDate(nextWeekFrom.getDate() + 7));
  //Set min date for #to
  var minDateTo = new Date(date.setDate(nextWeekFrom.getDate() + 1));

  // SET OPTIONS FOR FROM DATEPICKER
  var optionsFrom = {
    i18n: inter_es,
    minDate: date,
    defaultDate: date,
    setDefaultDate: true,
    autoClose: true,
    format: "dd/mm/yyyy",
    onSelect: function (el) {
      const ell = new Date(el);
      const setMM = ell.getDate() + 1;
      const setM = new Date(ell.setDate(setMM));
      setMinTo(setM);
      console.log(el, setM);
    },
  };

  // SET OPTIONS FOR TO DATEPICKER
  var optionsTo = {
    i18n: inter_es,
    minDate: new Date(minDateTo),
    defaultDate: new Date(nextWeekTo),
    setDefaultDate: true,
    autoClose: true,
    format: "dd/mm/yyyy",
  };

  // FUNCTION TO SET MINIMUM DATE WHEN FROM DATE SELECTED
  var setMinTo = function (vad) {
    // Get the current date set on #to datepicker
    var instance = M.Datepicker.getInstance($("#to"));
    instance.options.minDate = vad;

    // Check if the #from date is greater than the #to date and modify by 1 day if true.
    if (new Date(instance) < vad) {
      instance.setDate(vad);
      $("#to").val(instance.toString());
    }
  };

  $("#showResults").click(function () {
    $(".disable").css({ "pointer-events": "auto", cursor: "auto" });
    $(".opacity").css("display", "none");
    pullValues($("#from").val(), $("#to").val());
    console.log(pullValues($("#from").val(), $("#to").val()));
  });

  function pullValues(start_date, end_date) {
    $.when(
      $.getJSON("ads-library-data", { start_date, end_date }),
      $.getJSON("ads_expenses", { start_date, end_date }),
      $.getJSON("count_per_candidate", { start_date, end_date }),
      $.getJSON("tree_map_spend", { start_date, end_date }),
      $.getJSON("perfil_expenses", { start_date, end_date }),
      $.getJSON("funding_entity", { start_date, end_date })
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
      // Highcharts.chart("container_plot1", {
      //   chart: {
      //     type: "line",
      //   },
      //   title: {
      //     text: "Likes Crowdtangle",
      //   },
      //   // subtitle: {
      //   //   text: "Source: WorldClimate.com",
      //   // },
      //   xAxis: {
      //     type: "datetime",
      //     categories: Object.keys(_line_comparative["Arce"]).map((mmm) => {
      //       return parseInt(mmm);
      //     }),
      //   },
      //   // yAxis: {
      //   //   title: {
      //   //     text: "Temperature (°C)",
      //   //   },
      //   // },
      //   plotOptions: {
      //     line: {
      //       dataLabels: {
      //         enabled: true,
      //       },
      //       // enableMouseTracking: false,
      //     },
      //   },
      //   series: Object.keys(_line_comparative).map((candidateName) => {
      //     return {
      //       name: candidateName,
      //       data: Object.keys(_line_comparative[candidateName]).map(
      //         (key) => _line_comparative[candidateName][key]
      //       ),
      //       // data: Object.keys(count_per_candidate[c]).map((timestamp) => [
      //       //   parseInt(timestamp),
      //       //   count_per_candidate[c][timestamp],
      //       // ]),
      //     };
      //   }),
      // });
      console.log(_ads_expenses);
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
      // console.log(funding_entity, no_repeat);
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
  }

  pullValues("04/08/2020", "27/10/2020");
  $(document).ready(function () {
    var $from = $("#from").datepicker(optionsFrom);
    var $to = $("#to").datepicker(optionsTo);

    $(".chips-autocomplete").chips({
      autocompleteOptions: {
        data: {
          Apple: null,
          Microsoft: null,
          Google: null,
        },
        limit: Infinity,
        minLength: 1,
      },
    });
  });
});
