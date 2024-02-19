(function(){
const {h1,p,br,em,ruby,rt,rp} = van.tags
class JavelParser {
    constructor() {
        this._manuscript = van.state('')
        this._textBlocks = van.derive(()=>this.#toBlocks(this._manuscript.val))
        this._htmls = van.derive(()=>this.#toHtml(this._textBlocks.val))
        this._count = van.derive(()=>this.#count(this._htmls.val))
    }
    get manuscript( ) { console.log('get manu');return this._manuscript.val }
    set manuscript(v) { console.log('set manu');this._manuscript.val = v}
    get textBlocks() { return this._textBlocks.val }
    get htmls() { return this._htmls.val }
    get count() { return this._count.val }
    #toBlocks(text) {
        console.log('toBlocks()')
        if (0===text.trim().length) { return [] }
        text = text.replace('\r\n', '\n')
        text = text.replace('\r', '\n')
        const blocks = []; let start = 0;
        for (let match of text.matchAll(/\n\n/gm)) {
            blocks.push(text.slice(start, match.index).trimLine())
            start = match.index + 2
        }
        blocks.push(text.slice(start).trimLine())
        return blocks.filter(v=>v)
    }
    #toHtml(blocks) { return blocks.map(b=>((b.startsWith('# ')) ? h1(this.#inline(b.slice(2))) : p(this.#inline(b)))) }
    #inline(block) { 
        console.log(block)
        const inlines = []; let start = 0;
        for (let d of this.#genBrEmRuby(block)) {
            console.log(d)
            inlines.push(block.slice(start, d.index))
            inlines.push(d.html)
            start = d.index + d.length
            console.log(start, d.index, d.length)
        }
        inlines.push(block.slice(start).trimLine())
        console.log(inlines)
        return inlines.filter(v=>v)
    }
    #genBrEmRuby(text) { return [...this.#genBr(this.#matchBr(text)), ...this.#genEm(this.#matchEm(text)), ...this.#genRuby(this.#matchRubyL(text)), ...this.#genRuby(this.#matchRubyS(text))].sort((a,b)=>a.index - b.index) }
    #genBr(matches) { return matches.map(m=>({'match':m, 'html':br(), 'index':m.index, 'length':m[0].length})) }
    #matchBr(text) { return [...text.matchAll(/[\r|\r?\n]/gm)] }
    #matchEm(text) { return [...text.matchAll(/《《([^｜《》\n]+)》》/gm)] }
    #genEm(matches) { return matches.map(m=>({'match':m, 'html':em(m[1]), 'index':m.index, 'length':m[0].length}))}
    #matchRubyL(text) { return [...text.matchAll(/｜([^｜《》\n\r]{1,50})《([^｜《》\n\r]{1,20})》/gm)] }
    #matchRubyS(text) { return [...text.matchAll(/([一-龠々仝〆〇ヶ]{1,50})《([^｜《》\n\r]{1,20})》/gm)] }
    #genRuby(matches) { return matches.map(m=>({match:m, html:ruby(m[1], rp('（'), rt(m[2]), rp('）')), 'index':m.index, length:m[0].length})) }
    #count(htmls) { return htmls.reduce((sum, el)=>sum + el.innerText.length, 0) }
}
window.JavelParser = JavelParser
})()
