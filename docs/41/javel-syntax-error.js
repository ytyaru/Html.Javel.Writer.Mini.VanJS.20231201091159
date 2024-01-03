(function(){
class JavelSyntaxError {
    static id = 0
    static summary = 'Javel構文エラーです。'
    static details = 'チェックしたテキストにJavel構文エラーが含まれています。'
    constructor(text, start, end) {
        this.start = start
        this.end = end
        this.line = this.#getLineCount(text.slice(0, start))
    }
    #getLineCount(text) { return (text.match(/\n/g) || []).length; }
    static check(text) {
        const errors = []
        const ERRORS = [ExceedLineBreak]
        return ERRORS.map(ERR=>ERR.check(text)).flat().sort((a,b)=>a.start - b.start)
    }
}
class ExceedLineBreak extends JavelSyntaxError {
    static id = 1
    static summary = '３つ以上連続した改行があります。'
    static details = '連続改行は２つ以下にしてください。１つならパラグラフ内改行、２つならパラグラフ分断です。'
    static methodSummary = '３つ以上連続した改行箇所を２連続改行に置換します。'
    static REGEX = /[\n]{3,}/g
    constructor(text, start, end) { super(text, start, end) }
    static check(text) { return Array.from(text.matchAll(this.REGEX)).map(m=>new ExceedLineBreak(text, m.index, m.index+m[0].length)) }
    method() { return '\n\n' }
}
window.JavelSyntaxError = JavelSyntaxError
})()
