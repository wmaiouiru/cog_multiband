/*


  Convert Ref: 
  https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
*/


const debug = require('debug')('cog');
const GeoTIFF = require('geotiff');


function tile2long(x,z) {
  return (x/Math.pow(2,z)*360-180);
 }
 function tile2lat(y,z) {
  var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
  return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
 }

const x = 227804;
var y = 640169;
const z = 20;
const tms = true;
if(tms){
  y = (Math.pow(2, z) - 1) - y;
  debug('new y', y);
}
const cogUrl = 'https://s3.amazonaws.com/share-terravion-com/2018_cog/2018-07-31_1423-19_452c4761-6104-4c0d-9b16-4a2208d29bc8_142eff75-885f-4bc7-8556-0356ce227f26_Product-Performance-Wheat_MULTIBAND_4326.tiff';
GeoTIFF.fromUrl(cogUrl).then(tiff => {
  debug('debug', tiff)
  tiff.getImage().then(image => {
    var minLat = tile2lat(y, z);
    var minLng = tile2long(x, z);
    var maxLat = tile2lat(y + 1 , z);
    var maxLng = tile2long(x + 1 , z);
    const width = image.getWidth();
    const height = image.getHeight();
    const tileWidth = image.getTileWidth();
    const tileHeight = image.getTileHeight();
    const samplesPerPixel = image.getSamplesPerPixel();
    const bbox = image.getBoundingBox();
    const resolution = image.getResolution();
    debug('width', width);
    debug('height', height);
    debug('tileWidth', tileWidth);
    debug('tileHeight', tileHeight);
    debug('samplesPerPixel', samplesPerPixel);
    debug('resolution', resolution);
    debug('bbox', bbox[0], bbox[1], bbox[2], bbox[3]);
    // debug('tileBbox', minLng, maxLat, maxLng, minLat);
    debug('tileBbox', maxLat, minLng, minLat, maxLng);
    // [left, top, right, bottom]
    // [maxLat, minLng, minLat, maxLng]
    var tileBbox = [minLng, maxLat, maxLng, minLat];
    image.readRasters({
      width: 256,
      height: 256,
      // window: [minLng, maxLat, maxLng, minLat],
      bbox: tileBbox,
      // bbox: bbox,
      resampleMethod: 'bilinear',
      samples: [0, 1, 3],
      fillValue: 0
    }).then(data => {
      debug('data', data.length);
      debug('data[0].length', data[0].length);
      for(var index =0; index < data[0].length; index++){
        debug('index checking', index, data[0][index]);
      }
    }).catch(e => {
      debug('e', e);
    })
  });
});