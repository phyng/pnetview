
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import { JSDOM } from 'jsdom'

const getPage = async (pageNumber: number) => {
  const response = await axios.get(`https://wakatime.com/leaders?page=${pageNumber}`)
  const dom = new JSDOM(response.data, {
    url: 'https://wakatime.com/leaders',
    referrer: 'https://wakatime.com/leaders',
    contentType: 'text/html',
    includeNodeLocations: true,
    storageQuota: 10000000
  })
  const trs = Array.from(dom.window.document.querySelectorAll('.leaders tbody tr'))
  console.log(`Page ${pageNumber} ${trs.length}`)
  return trs.map((tr) => {
    return {
      languanges: Array.from(tr.querySelectorAll('.langcol a')).map(a => a.textContent || '').filter(i => !!i)
    }
  })
}

const run = async () => {
  const languanges: string[][] = []
  for (const pageNumber of Array.from({ length: 10 }, (_, i) => i + 1)) {
    const results = await getPage(pageNumber)
    languanges.push(...results.map(r => r.languanges))
  }
  fs.writeFileSync(path.join(__dirname, './wakatime-leaders.json'), JSON.stringify(languanges))
}

if (require.main === module) {
  run()
}
