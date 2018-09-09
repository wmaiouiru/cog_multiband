const debug = require('debug')('cog');
const GeoTIFF = require('geotiff');

function sinh(arg) {
  return (Math.exp(arg) - Math.exp(-arg)) / 2;
}

function tileToLng(x, z) {
  return x * 360 / Math.pow(2,z) - 180;
}

function tileToLat(y, z) {
  return Math.atan(sinh(Math.PI - y * 2 * Math.PI / Math.pow(2, z))) * (180 / Math.PI);
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
    var minLat = tileToLat(y, z);
    var minLng = tileToLng(x, z);
    var maxLat = tileToLat(y + 1 , z);
    var maxLng = tileToLng(x + 1 , z);
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
    debug('bbox', bbox);
    debug('tileBbox', minLng, maxLat, maxLng, minLat);
    // [left, top, right, bottom]
    image.readRasters({
      width: 256,
      height: 256,
      window: [minLng, maxLat, maxLng, minLat],
      // bbox: [minLng, maxLat, maxLng, minLat],
      resampleMethod: 'bilinear',
      samples: [0, 1 , 2, 7],
      fillValue: 0
    }).then(data => {
      debug('data', data.length);
      debug('data[0].length', data[1].length);
      for(var index =0; index < data[1].length; index++){
        debug('index checking', index, data[1][index]);
      }
    }).catch(e => {
      debug('e', e);
    })
  });
});