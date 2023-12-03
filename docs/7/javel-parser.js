(function(){
class JavelParser {
    toHtmls(ja) {
        console.log('derive() htmls', this)
        const lines = ja.trim().split(/\r?\n/)
        const blocks = this.#makeBlocks(lines)
        return this.#blocksToHtmls(blocks)
    }
    #makeBlocks(lines) {
        const [blocks, block] = [[], []]
        for (let line of lines) {
            block.push(line)
            if (''===line && 0 < block.length) { blocks.push(block.join('\n')); block.splice(0); }
        }
        if (0 < block.length) { blocks.push(block.join('\n')) }
        return blocks.filter(v=>v)
    }
    #blocksToHtmls(blocks) { return blocks.map(block=>(block.startsWith('# ')) ? h1(block.slice(2)) : p(block.split(/\n/).filter(v=>v).map(line=>[span(line), br()]).flat().slice(0, -1))) }

    #inline(text) {
        const inlines = []
        inlines.push(this.#em(...))
        inlines.push(this.#ruby(...))
        inlines.push(this.#span(...))
        const matchs = {
            'em': text.matchAll(/《《([^\n]{1,50}?)》》/g),
            'rubyS': text.matchAll(/([一-龠々仝〆〇ヶ]{1,50})《([^｜《》\n\r]{1,20})》/g),
            'rubyL': text.matchAll(/｜([^｜《》\n\r]{1,50})《([^｜《》\n\r]{1,20})》/g),
        }
        console.log(matchs)
        Em.matches()
        //inlines.push({start:0, end:0, html:this.#em()})
        '《《'
        '》》'
        return inlines
    }
    #isEm(text) {
        const REGEX_DOT = /《《([^\n]{1,50}?)》》/g;
    }
    #em(text) { return em(text) }
    #ruby(base, rt) { return ruby(base, rp('（'), rt(rt), rp('）'))

    }

}
Em.matchs()
Em.parse()
Ruby.parse()
class Em {
    static #REGEX = /《《([^\n]{1,50}?)》》/g;
    static matchs(text) {
        const matchs = []
        for (let i=0; i<text.Graphemes.length; i++) {
            if (i===text.Graphemes.length-1) { continue }
            const g1 = text.Graphemes[i]
            const g2 = text.Graphemes[i+1]
            if ('《'!==g1 || '《'!==g2) { continue }

            for (let k=i+2; k<text.Graphemes.length; k++) {
                if (k===text.Graphemes.length-1) { continue }
                const g3 = text.Graphemes[k]
                const g4 = text.Graphemes[k+1]
                if ('》'!==g3 || '》'!==g4) { continue }
                const len = k - (i+1) - 1 // g3 - g2 - 1
                if (len < 2 || 50 < len) { continue }
                matchs.push({index:i, length:len, html:em(text.Graphemes.slice(i+2, k))})  // (g2+1, g3)
            }
        }
        return matchs
    }
//    static matchs(text) { return [...text.matchAll(this.#REGEX)] }
    static parse(text) {
        return text.replace(this.#REGEX, (match, p1)=>{
            const text = [...p1].map(a => `<span>${a}</span>`).join('');
            return `<em class="emphasis">${text}</em>`;
        });
    }
}
class RubyParser {
    #SHORT = /([一-龠々仝〆〇ヶ]{1,50})《([^｜《》\n\r]{1,20})》/g
    #LONG = /｜([^｜《》\n\r]{1,50})《([^｜《》\n\r]{1,20})》/g
    #ESCAPE = /｜《/g
    parse(src) { return this.#escape([this.#LONG, this.#SHORT].reduce((src, reg)=>
            src.replace(reg, (match, rb, rt)=>{ return this.#toHtml(rb, rt) }), src)) }
    #escape(src) { return src.replace(this.#ESCAPE, (match)=>'《') }
    #toHtml(rb, rt) { return `<ruby>${rb}<rp>（</rp><rt>${rt}</rt><rp>）</rp></ruby>` }
}


window.Parser = new Parser()
})()
