const fs = require('fs');
const zlib = require('zlib');
const ProgressBar = require('progress');
const file = process.argv[2];
let bar = null, size = 0;

const { Transform } = require('stream');

const reportProgress = new Transform({
    transform(chunk, encoding, callback) {
        process.stdout.write('.');
        // process.stdout.write(chunk.length);
        callback(null, chunk);
    }
});
fs.stat(file, function(err, stat) {
    size = stat.size;
});
fs.createReadStream(file)
.on('open', ()=>{
    console.log('opening');
    bar = new ProgressBar('reading [:bar] :percent', {
        width: 30,
        total: size
    });
})
.on('data', function(chunk){
    bar.tick(chunk.length > size ? size: chunk.length);
})
.on('close', function(){
    console.log(`Ended`);
    console.log('bar total:', bar.total);
    console.log('bar current:', bar.curr);
})
.pipe(zlib.createGzip())
.pipe(reportProgress)
.pipe(fs.createWriteStream(file + '.zz'))
.on('finish', () => {
    console.log('done');
});