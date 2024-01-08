(function(){
class HtmlWordCounter {
    constructor(htmlViewer) {
        this.htmlViewer = htmlViewer
        this._isHeading = false
        this._isRuby = false
        this._isIndent = false
        this._count = van.state(0)
    }
    get state() { return this._count }
    get size() { return this._count.val }
    count() {
    //get count() {
        let count = 0
        for (let el of this.htmlViewer.element.children[0].children) { count += this.#count(el) }
        this._count.val = count
        return count
    }
    get isHeading() { return this._isHeading }  // h1〜h6を数えるか
    set isHeading(v) { this._isHeading = v }
    get isRuby() { return this._isRuby }        // rtを数えるか
    set isRuby(v) { this._isRuby = v }
    get isIndent() { return this._isIndent }    // p内最初の全角空白を数えるか
    set isIndent(v) { this._isIndent = v }
    openDialog() {
        alert('openDialog()')
    }
    #count(el) {
        const tagName = this.#tagName(el)
        if (this.#isHeading(tagName)) { return this.#countHeading(el) }
        //else if (this.#isParagraph(tagName)) { return this.#countInline(el) }
        else if (this.#isParagraph(tagName)) { return this.#countInline(el) - ((0 < el.inerText && '　'===el.innerText[0] && !this.isIndent) ? 1 : 0) }// このままだとp内改行直後の全角空白は含まれてしまう！
        else { throw new Error(`h1〜6, p, 以外のブロック要素は対象外です。:${tagName}`) }
    }
    #countHeading(el) { return (this.isHeading) ? this.#countInline(el) : 0 }
    #countInline(el) {
        let count = 0
        for (let node of el.childNodes) {
//            console.log('node.nodeType:', node.nodeType)
            if (3===node.nodeType) { count += node.innerText.Graphemes.length } // 3:TEXT_NODE
            else if (1===node.nodeType) { // 1:ELEMENT_NODE
                const tagName = this.#tagName(node)
                if (this.#isEm(tagName)) { count += node.innerText.Graphemes.length }
                else if (this.#isRuby(tagName)) { count += this.#countRuby(node) }
                else if (this.#isSpan(tagName)) { count += node.innerText.Graphemes.length }
                else if (this.#isBr(tagName)) {  }
                else { throw new Error(`ruby, em, span, br, 以外のインライン要素は対象外です。:${tagName}`) }
            }
        }
        return count
    }
    #countRuby(node) {
        if (this.isRuby) { return node.innerText.Graphemes.length }
        let count = node.innerText.Graphemes.length
        for (let child of node.children) {
            const tagName = this.#tagName(child)
            count -= (this.#isRt(tagName)) ? child.innerText.Graphemes.length : 0
            count -= (this.#isRp(tagName)) ? child.innerText.Graphemes.length : 0
        }
        return count
    }
    #tagName(el) { return el.tagName.toLowerCase() }
    #isHeading(tagName) { return tagName.match(/h[1-6]/g) }
    #isParagraph(tagName) { return 'p'===tagName }
    #isEm(tagName) { return 'em'===tagName }
    #isRuby(tagName) { return 'ruby'===tagName }
    #isRt(tagName) { return 'rt'===tagName }
    #isRp(tagName) { return 'rp'===tagName }
    #isSpan(tagName) { return 'span'===tagName }
    #isBr(tagName) { return 'br'===tagName }
}
//window.htmlWordCounter = new HtmlWordCounter()
window.HtmlWordCounter = HtmlWordCounter
})()
