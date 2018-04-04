const request = require("request"),
    NodeCache = require("node-cache"),
    rqCache = new NodeCache({ stdTTL: 10000, checkperiod: 120 });

let options = {
    method: 'GET',
    url: 'http://svc.metrotransit.org/NexTrip/Routes',
    headers:
        { 'Accept': 'application/json' }
};

function rq(options, key) {
    return new Promise((resolve, reject) => {
        let value = rqCache.get(key);
        // console.log(value ? value.length : undefined);
        if (!value) {
            request(options, function (err, response, data) {
                if (err)
                    reject(err);
                if (data) {
                    data = JSON.parse(data);
                    rqCache.set("Routes", data);
                    resolve(data);
                }
            })
        } else {
            resolve(value)
        }
    })
}

let cmdArg = (process.argv).splice(2, 3);

if (cmdArg.length !== 3) {
    console.log("Invalid input");
} else {
    let routeCode, directionCode, stopCode;
    rq(options, "Routes")
        .then((data) => {
            data.forEach(ele => {
                if (((ele.Description).toLowerCase()).includes(cmdArg[0].toLowerCase())) {
                    routeCode = ele.Route;
                }
            });
            return Promise.resolve(routeCode);
        }).then((data) => {
            if (data) {
                options.url = "http://svc.metrotransit.org/NexTrip/Directions/" + data;
                return rq(options, "Routes" + data)
            } else {
                return Promise.reject("Route not Found")
            }
        }).then((data) => {
            data.forEach(ele => {
                if (((ele.Text).toLowerCase()).includes(cmdArg[2].toLowerCase())) {
                    directionCode = ele.Value;
                }
            });
            return Promise.resolve(directionCode);
        }).then((data) => {
            if (data) {
                options.url = "http://svc.metrotransit.org/NexTrip/Stops/" + routeCode + "/" + data;
                return rq(options, "Routes" + routeCode + data)
            } else {
                return Promise.reject("Direction not Found")
            }
        }).then((data) => {
            data.forEach(ele => {
                if (((ele.Text).toLowerCase()).includes(cmdArg[1].toLowerCase())) {
                    stopCode = ele.Value;
                }
            });
            return Promise.resolve(stopCode);
        }).then((data) => {
            if (data) {
                options.url = "http://svc.metrotransit.org/NexTrip/" + routeCode + "/" + directionCode + "/" + data;
                return rq(options, "Routes" + routeCode + directionCode + data)
            } else {
                return Promise.reject("Transit not available")
            }
        }).then((data) => {
            console.log(data[0].DepartureText);
        }).catch(err => {
            console.error(err);
        })
}