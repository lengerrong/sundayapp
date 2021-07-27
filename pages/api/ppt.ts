import { assertProxies } from "mobx/dist/internal";

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const PPTX = require('nodejs-pptx')
const fs = require('fs')

export default async function handler(req, res) {
  console.log(req.body)

  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  })
  let pptx = new PPTX.Composer()
  await pptx.load(__dirname + '/../../templates/worship.pptx')
  const tmpPPTX = '/tmp/worship' + Math.random() + '.pptx'
  console.log(tmpPPTX)
  
  pptx.compose(pres => {
    let slide = pres.getSlide(1)
    //console.log(slide.getSlideXmlAsString())
  });
  await pptx.save(tmpPPTX)
  var rs = fs.createReadStream(tmpPPTX)
  rs.on('error', function(err) {
    fs.unlinkSync(tmpPPTX)
    res.end(err)
  })
  rs.on('finish', function() {
    fs.unlinkSync(tmpPPTX)
    res.end()
  })
  res.on('error', function(err) {
    fs.unlinkSync(tmpPPTX)
    res.end(err)
  })
  res.on('finish', function() {
    fs.unlinkSync(tmpPPTX)
    res.end()
  })
  rs.pipe(res)
}