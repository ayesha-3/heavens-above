const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const utils = require("./utils");

let options = {}; // was const, must be let
// Removed getCurrentSatelliteData() – not defined or used

const eventsIridium = [
  "brightness", "altitude", "azimuth", "satellite", "distanceToFlareCentre",
  "brightnessAtFlareCentre", "date", "time", "distanceToSatellite",
  "AngleOffFlareCentre-line", "flareProducingAntenna", "sunAltitude",
  "angularSeparationFromSun", "image", "id"
];

function getTable(config) {
  let database = config.database || [];
  let counter = config.counter || 0;
  const opt = config.opt || 0;
  const basedir = config.root + "IridiumFlares/";

  if (counter === 0) {
    options = utils.get_options("IridiumFlares.aspx?");
    if (!fs.existsSync(basedir)) {
      fs.mkdir(basedir, (err) => {
        if (err) console.log(err);
      });
    }
  } else {
    options = utils.post_options("IridiumFlares.aspx?", opt);
  }

  request(options, (error, response, body) => {
    if (error || response.statusCode !== 200) return;

    const $ = cheerio.load(body, { decodeEntities: false });
    let next = "__EVENTTARGET=&__EVENTARGUMENT=&__LASTFOCUS=";
    const tbody = $("form").find("table.standardTable tbody");
    const queue = [];

    tbody.find("tr").each((i, o) => {
      const temp = {};
      for (let j = 0; j < 6; j++) {
        temp[eventsIridium[j]] = $(o).find("td").eq(j + 1).text();
      }
      temp.url = "https://www.heavens-above.com/" + $(o).find("td").eq(0).find("a").attr("href").replace("type=V", "type=A");
      queue.push(temp);
    });

    function factory(temp) {
      return new Promise((resolve, reject) => {
        request(utils.iridium_options(temp.url), (error, response, body) => {
          if (error || response.statusCode !== 200) {
            reject(error);
            return;
          }

          console.log("Success", temp);
          const $ = cheerio.load(body, { decodeEntities: false });
          const table = $("form").find("table.standardTable");
          const tr = table.find("tbody tr");

          [
            [6, 0], [7, 1], [8, 6], [9, 7],
            [10, 9], [11, 10], [12, 11]
          ].forEach(([ei, ti]) => {
            temp[eventsIridium[ei]] = tr.eq(ti).find("td").eq(1).text();
          });

          temp.image = "https://www.heavens-above.com/" + $("#ctl00_cph1_imgSkyChart").attr("src");
          const id = utils.md5(Math.random().toString());
          temp.id = id;

          fs.appendFile(basedir + id + ".html", table.html(), (err) => {
            if (err) console.log(err);
          });

          request
            .get(utils.image_options(temp.image))
            .pipe(fs.createWriteStream(basedir + id + ".png", { flags: "a" }))
            .on("error", console.error);

          resolve(temp);
        });
      });
    }

    Promise.allSettled(queue.map(temp => factory(temp))).then(results => {
      results = results.filter(p => p.status === "fulfilled").map(p => p.value);
      database = database.concat(results);

      $("form").find("input").each((i, o) => {
        const name = $(o).attr("name");
        if (name !== "ctl00$cph1$btnPrev" && name !== "ctl00$cph1$visible") {
          next += `&${name}=${$(o).attr("value")}`;
        }
      });

      next += "&ctl00$cph1$visible=radioVisible";
      next = next.replace(/\+/g, "%2B").replace(/\//g, "%2F");

      if (counter++ < config.pages) {
        getTable({ ...config, counter, opt: next, database });
      } else {
        fs.appendFile(basedir + "index.json", JSON.stringify(database), (err) => {
          if (err) console.log(err);
        });
      }
    });
  });
}

exports.getTable = getTable;
