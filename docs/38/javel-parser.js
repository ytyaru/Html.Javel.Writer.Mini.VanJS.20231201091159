(function(){
const { h1, p, br, em, ruby, rt, rp, span } = van.tags
class JavelParser {
    constructor() { this.textBlocks=null; this.htmlBlocks=null; }
    toHtmls(ja) { // 全文パース
        console.debug('derive() htmls', this)
        this.textBlocks = TextBlock.fromText(ja)
        console.debug(this.textBlocks)
        this.htmlBlocks = this.#blocksToHtmls(this.textBlocks)
        console.debug(this.htmlBlocks)
        return this.htmlBlocks
    }
    setBlockText(blockIndex, ja) {
        console.log('setBlockText() *****************************')
        console.log(blockIndex, ja)
        console.log(this.textBlocks)
        this.textBlocks[blockIndex] = ja
        this.htmlBlocks[blockIndex] = this.#blocksToHtmls([ja])[0]
        return this.htmlBlocks
    }
    blockToHtml(text) { return this.#blocksToHtmls([text])[0] }
    pasteBlocks(index, blocks, deleteCount=2) {
        this.textBlocks.splice(index, deleteCount, ...blocks)
        this.htmlBlocks.splice(index, deleteCount, ...this.#blocksToHtmls(blocks))
        console.log(this.textBlocks)
        console.log(this.htmlBlocks)
        return this.htmlBlocks
    }
    #blocksToHtmls(blocks) { return blocks.map(block=>(block.startsWith('# ')) ? h1(block.slice(2).split(/\n/).filter(v=>v).map(line=>[this.#inline(line), br()]).flat().slice(0, -1)) : p(block.split(/\n/).filter(v=>v).map(line=>[this.#inline(line), br()]).flat().slice(0, -1))) }
    #inline(text) {
        console.debug(text)
        const matches = EmRuby.matches(text)
        if (0===matches.length) { return [span({class:'text-node'},text)] }
        console.debug(matches)
        const spans = []
        let start = 0
        for (let i=0; i<matches.length; i++) {
            if (0 === matches[i].index) { start = matches[i].length; continue }
            const length = matches[i].index
            if (start === length) continue
            spans.push({index:start, length:length, html:span({class:'text-node'}, EmRuby.escapePipe(text.slice(start, length)))})
            start = matches[i].index + matches[i].length
        }
        if (start < text.length-1) { spans.push({index:start, length:text.length, html:span({class:'text-node'}, text.slice(start, text.length))}) }
        matches.push(spans)
        console.debug(matches.flat().sort((a,b)=>a.index - b.index))
        console.debug(matches.flat().sort((a,b)=>a.index - b.index).map(m=>m.html))
        console.debug(matches.flat().sort((a,b)=>a.index - b.index).map(m=>m.html.innerText))
        return matches.flat().sort((a,b)=>a.index - b.index).map(m=>m.html)
    }
}
class EmRuby {
    static matches(text) { // 漢字《かんじ》, ｜あいうえお《アイウエオ》
        if (!(text.includes('《') && text.includes('》'))) { return [] }
        console.debug('Em:', Em.matches(text))
        console.debug('Ruby.Long:', Ruby.matchesLong(text))
        console.debug('Ruby.Short:', Ruby.matchesShort(text))
        const matches = [...Em.matches(text), ...Ruby.matchesLong(text), ...Ruby.matchesShort(text)].flat()
        return matches.sort((a,b)=>a.index - b.index)
    }
    static escapePipe(text) { return text.replace(/｜《/g, '《').replace(/｜》/g, '》') }
}
class Em {
    static matches(text) { // 《《強調》》
        const matches = []
        console.debug(text)
        console.debug(text.Graphemes)
        console.debug(text.Graphemes.length)
        for (let i=0; i<text.Graphemes.length; i++) {
            if (i===text.Graphemes.length-1) { continue }
            const g1 = text.Graphemes[i]
            const g2 = text.Graphemes[i+1]
            if ('《'!==g1 || '《'!==g2) { continue }
            if ('｜'===g1 && '《'===g2) { continue } // エスケープ時は対象外
            for (let k=i+2; k<text.Graphemes.length; k++) {
                if (text.Graphemes.length-1<=k) { continue }
                const g3 = text.Graphemes[k]
                const g4 = text.Graphemes[k+1]
                if ('》'!==g3 || '》'!==g4) { continue }
                const len = k - (i+1) - 1 // g3 - g2 - 1
                if (len < 2 || 50 < len) { continue }
                const emTxt = text.Graphemes.slice(i+2, k) // (g2+1, g3)
                if (emTxt.includes('\n')) { continue }
                matches.push({index:i, length:(k+1)-i+1, html:em(emTxt)})
                break
            }
        }
        return matches
    }
}
class Ruby {
    static KANJI = {
        MIN: '一'.codePointAt(0),
        MAX: '龠'.codePointAt(0),
        ANO: ['々','仝','〆','〇','ヶ'].map(k=>k.codePointAt(0)),
    }
    static matches(text) { // ｜あいうえお《アイウエオ》
        if (!(text.includes('《') && text.includes('》'))) { return [] }
        const matches = [...this.matchesLong(text), ...this.matchesShort(text)].flat()
        return matches.sort((a,b)=>a.index - b.index)
    }
    static matchesLong(text) { // ｜あいうえお《アイウエオ》
        const matches = []
        const graphemes = text.Graphemes
        for (let i=0; i<graphemes .length; i++) {
            if (i===graphemes.length-1) { continue }
            const pipe = graphemes[i]
            if ('｜'!==pipe) { continue }
            const pipeNext = graphemes[i+1]
            if (['《','》'].some(m=>m===pipeNext)) { continue } // 《》メタ文字エスケープ
            for (let k=i+2; k<graphemes.length; k++) {
                if (graphemes.length-1<=k) { continue }
                const r1 = graphemes[k]
                if ('《'!==r1) { continue }
                if ('《'===r1 && (0<k && '｜'===graphemes[k-1])) { continue } // エスケープ時は対象外
                const rbTxt = graphemes.slice(i+1, k)
                const baseLen = k - i
                if (50 < baseLen) { continue } // 親文字50字以上は長すぎるので対象外
                const r1Prev = graphemes[k-1]
                if ('｜'===r1Prev) { continue } // 《》メタ文字エスケープ
                if ('《'===r1Prev) { continue } // em
                const r1Next = graphemes[k+1]
                if ('《'===r1Next) { continue } // em
                for (let m=k+2; m<graphemes.length; m++) {
                    if (graphemes.length-1<=m) { continue }
                    const r2 = graphemes[m]
                    if ('》'!==r2) { continue }
                    const rtTxt = graphemes.slice(k+1, m)
                    const rtLen = m - k
                    if (20 < rtLen) { continue } // ルビ文字20字以上は長すぎるので対象外
                    if (graphemes.slice(i, m).includes('\n')) { continue } // 途中に改行があると無効
                    matches.push({index:i, length:m-i+1, html:ruby(rbTxt, rp('（'), rt(rtTxt), rp('）'))})  // (g2+1, g3)
                    break
                }
                break
            }
        }
        return matches
    }
    static #isKanji(g) { // g:Intl.Segmenter.graphemes
        const G = g.codePointAt(0)
        if (this.KANJI.MIN <= G && G <= this.KANJI.MAX) { return true }
        if (this.KANJI.ANO.some(k=>k===G)) { return true }
        return false
    }
    static matchesShort(text) { // 漢字《かんじ》
        const matches = []
        const graphemes = text.Graphemes
        for (let i=0; i<graphemes.length; i++) {
            const r1 = graphemes[i]
            if ('《'!==r1) { continue }
            let K = i;
            for (let k=i-1; 0<=k; k--) {
                console.debug('isKanji:', graphemes[k], this.#isKanji(graphemes[k]))
                if (!this.#isKanji(graphemes[k])) { break } // 非漢字ならルビ対象外。
                if ('｜'===graphemes[k]) { K=i; break; } // ｜ならLongRubyの可能性有で対象外（２段breakしたくてK=i continue使用）
                K = k
            }
            if (K===i) { continue } // 親文字（漢字）がない
            const rbTxt = graphemes.slice(K, i)
            console.debug('rbTxt:', rbTxt, K, i)
            for (let m=i+2; m<graphemes.length; m++) {
                const r2 = graphemes[m]
                if ('》'!==r2) { continue }
                const rtTxt = graphemes.slice(i+1, m)
                matches.push({index:K, length:(i-K)+m-i+1, html:ruby(rbTxt, rp('（'), rt(rtTxt), rp('）'))})
                break
            }
        }
        return matches
    }
}
window.JavelParser = JavelParser
})()
