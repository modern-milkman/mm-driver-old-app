/**
 * based on:
 * @author Ophir LOJKINE
 * salesman npm module
 *
 * Good heuristic for the traveling salesman problem using simulated annealing.
 * @see {@link https://lovasoa.github.io/salesman.js/|demo}
 **/

/**
 * @private
 */
function Path(points, hasDummy = false) {
  this.points = points;
  this.order = new Array(points.length);
  for (var i = 0; i < points.length; i++) {
    this.order[i] = i;
  }
  this.distances = new Array(points.length * points.length);
  for (var i = 0; i < points.length; i++) {
    for (var j = 0; j < points.length; j++) {
      this.distances[j + i * points.length] =
        hasDummy &&
        ((i === 0 && j === points.length - 1) ||
          (j === 0 && i === points.length - 1) ||
          (i === points.length - 2 && j === points.length - 1) ||
          (j === points.length - 2 && i === points.length - 1))
          ? 0
          : distance(points[i], points[j]);
    }
  }
}
Path.prototype.change = function (temp) {
  var i = this.randomPos(),
    j = this.randomPos();
  var delta = this.delta_distance(i, j);
  if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
    this.swap(i, j);
  }
};
Path.prototype.size = function () {
  var s = 0;
  for (var i = 0; i < this.points.length; i++) {
    s += this.distance(i, (i + 1) % this.points.length);
  }
  return s;
};
Path.prototype.swap = function (i, j) {
  var tmp = this.order[i];
  this.order[i] = this.order[j];
  this.order[j] = tmp;
};
Path.prototype.delta_distance = function (i, j) {
  var jm1 = this.index(j - 1),
    jp1 = this.index(j + 1),
    im1 = this.index(i - 1),
    ip1 = this.index(i + 1);
  var s =
    this.distance(jm1, i) +
    this.distance(i, jp1) +
    this.distance(im1, j) +
    this.distance(j, ip1) -
    this.distance(im1, i) -
    this.distance(i, ip1) -
    this.distance(jm1, j) -
    this.distance(j, jp1);
  if (jm1 === i || jp1 === i) {
    s += 2 * this.distance(i, j);
  }
  return s;
};
Path.prototype.index = function (i) {
  return (i + this.points.length) % this.points.length;
};
Path.prototype.access = function (i) {
  return this.points[this.order[this.index(i)]];
};
Path.prototype.distance = function (i, j) {
  return this.distances[this.order[i] * this.points.length + this.order[j]];
};
// Random index between 1 and the last position in the array of points
Path.prototype.randomPos = function () {
  return 1 + Math.floor(Math.random() * (this.points.length - 1));
};

/**
 * Solves the following problem:
 *  Given a list of points and the distances between each pair of points,
 *  what is the shortest possible route that visits each point exactly
 *  once and returns to the origin point?
 *
 * @param {Point[]} points The points that the path will have to visit.
 * @param {Number} [temp_coeff=0.999] changes the convergence speed of the algorithm: the closer to 1, the slower the algorithm and the better the solutions.
 * @param {Function} [callback=] An optional callback to be called after each iteration.
 *
 * @returns {Number[]} An array of indexes in the original array. Indicates in which order the different points are visited.
 *
 * @example
 * var points = [
 *       new salesman.Point(2,3)
 *       //other points
 *     ];
 * var solution = salesman.solve(points);
 * var ordered_points = solution.map(i => points[i]);
 * // ordered_points now contains the points, in the order they ought to be visited.
 **/
function solve(points, hasDummy = false, temp_coeff, callback) {
  var path = new Path(points, hasDummy);
  if (points.length < 2) {
    return path.order;
  } // There is nothing to optimize
  if (!temp_coeff) {
    temp_coeff = 1 - Math.exp(-10 - Math.min(points.length, 1e6) / 1e5);
  }
  var has_callback = typeof callback === 'function';

  for (
    var temperature = 100 * distance(path.access(0), path.access(1));
    temperature > 1e-6;
    temperature *= temp_coeff
  ) {
    path.change(temperature);
    if (has_callback) {
      callback(path.order);
    }
  }
  return path.order;
}

/**
 * Represents a point in two dimensions.
 * @class
 * @param {Number} x abscissa
 * @param {Number} y ordinate
 */
function Point(x, y, key) {
  this.x = x;
  this.y = y;
  this.key = key;
}

function distance(p, q, unit) {
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //:::                                                                         :::
  //:::  This routine calculates the distance between two points (given the     :::
  //:::  latitude/longitude of those points). It is being used to calculate     :::
  //:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
  //:::                                                                         :::
  //:::  Definitions:                                                           :::
  //:::    South latitudes are negative, east longitudes are positive           :::
  //:::                                                                         :::
  //:::  Passed to function:                                                    :::
  //:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
  //:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
  //:::    unit = the unit you desire for results                               :::
  //:::           where: 'M' is statute miles (default)                         :::
  //:::                  'K' is kilometers                                      :::
  //:::                  'N' is nautical miles                                  :::
  //:::                  'ME' is meters                                         :::
  //:::                                                                         :::
  //:::  Worldwide cities and other features databases with latitude longitude  :::
  //:::  are available at https://www.geodatasource.com                         :::
  //:::                                                                         :::
  //:::  For enquiries, please contact sales@geodatasource.com                  :::
  //:::                                                                         :::
  //:::  Official Web site: https://www.geodatasource.com                       :::
  //:::                                                                         :::
  //:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
  //:::                                                                         :::
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  const { x: lat1, y: lon1 } = p;
  const { x: lat2, y: lon2 } = q;
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit === 'K') {
      dist = dist * 1.609344;
    }
    if (unit === 'N') {
      dist = dist * 0.8684;
    }
    if (unit === 'ME') {
      dist = dist * 1609.344;
    }
    return dist;
  }
}

export { distance, Point, solve };
