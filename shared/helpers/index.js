import { HOST_NAME, PORT } from '../config'
import { get } from 'http'

/**
 * Private methods
 */

function _ajaxRequest(url) {
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.onload = function() {
      if (request.status >= 200 && request.status < 400)
        resolve(request.responseText)
      else
        reject(request)

    }
    request.onerror = reject
    request.send()
  })
}

function _nodeRequest(url, hostname, port) {

  var options = {
    host: HOST_NAME,
    port: PORT,
    path: url
  }
  return new Promise(function(resolve, reject) {
    get(options, function(res, body) {
      res.on('data', function (chunk) {
        resolve(chunk)
      })
    }).on('error', function(e) {
      reject(e)
    })
  })
}

/**
 * Public methods
 */

/**
 * Get the base url of the project reading the config variables
 * @param   { String } hostname - to override the hostname
 * @param   { Number } port - to override the port
 * @returns { String } return the base path of the app
 */
export function getBase(hostname, port) {
  return `http://${ hostname || HOST_NAME }:${ port || PORT }`
}

/**
 * Detect if we are running the code on a node environment
 * @returns {Boolean} - either true or false
 */
function isNode() {
  return typeof window === 'undefined'
}

/**
 * Cheap fetch polyfill that works also on node because whatwg-fetch sucks!
 * @param   { String } url - url to call
 * @param   { String } hostname - optional hostname
 * @param   { Number } port - optional port
 * @returns { Promise } hoping to get this promise resolved..
 */
export function fetch(url, hostname, port) {
  if (isNode()) {
    return _nodeRequest(url, hostname, port)
  } else {
    return _ajaxRequest(`${ getBase(hostname, port) }${ url }`)
  }
}