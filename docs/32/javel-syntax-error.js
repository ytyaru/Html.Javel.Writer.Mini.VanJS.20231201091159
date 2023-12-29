(function(){
/*
class JavelSyntaxError {
    constructor(textarea) { this.textarea=textarea; this.errors=[]; }
    }
    check(text) {
        const errors = {}
        const ERRORS = [ExceedLineBreak]
        for (let ERR of ERRORS) { errors.push(ERR.check().flat()) }
        return errors
    }
    fix() {
        for (let error of this.check()) {
            // ひとつ実行すると修正前と後でindexがズレてしまう！
            this.textarea.value = this.textarea.value.slice(0, error.start)
                                + error.method()
                                + this.textarea.value.slice(error.end+1)
        }
    }
}
*/
class JavelSyntaxError {
    static id = 0
    static summary = 'Javel構文エラーです。'
    static details = 'チェックしたテキストにJavel構文エラーが含まれています。'
    constructor(text, start, end) {
//        this.id = 0
//        this.name = 'JavelSyntaxError'
//        this.summary = 'Javel構文エラーです。'
//        this.details = 'チェックしたテキストにJavel構文エラーが含まれています。'
        this.start = start
        this.end = end
        //this.line = line
        this.line = this.#getLineCount(text.slice(0, start))
    }
    #getLineCount(text) { return (text.match(/\n/g) || []).length; }
    method(text) { return text.slice(start, end) }
    static check(text) {
        const errors = []
        const ERRORS = [ExceedLineBreak]
//        for (let ERR of ERRORS) { errors.push(ERR.check(text).flat()) }
//        errors.sort((a,b)=>a.start - b.start)
//        return errors
        return ERRORS.map(ERR=>ERR.check(text)).flat().sort((a,b)=>a.start - b.start)
    }
    static fix(errors) {
        for (let error of errors) {
            // ひとつ実行すると修正前と後でindexがズレてしまう！
            this.textarea.value = this.textarea.value.slice(0, error.start)
                                + error.method()
                                + this.textarea.value.slice(error.end+1)
        }
    }

}
class ExceedLineBreak extends JavelSyntaxError {
    static id = 1
    static summary = '３つ以上連続した改行があります。'
    static details = '連続改行は２つ以下にしてください。１つならパラグラフ内改行、２つならパラグラフ分断です。'
    static methodSummary = '３つ以上連続した改行箇所を２連続改行に置換します。'
    static REGEX = /[\n]{3,}/g
    //static REGEX = /([\n]{3,})/g
    //static REGEX = /[\n]{3,}/gm
    //static REGEX = /([\n]{3,})/gm
    constructor(text, start, end) {
        super(text, start, end)
//        this.id = 1
//        this.name = 'ExceedLineBreak'
//        this.summary = '３つ以上連続した改行があります。'
//        this.details = '連続改行は２つ以下にしてください。１つならパラグラフ内改行、２つならパラグラフ分断です。'
    }
    static check(text) {
        console.log(text)
        console.log(this.REGEX)
        const errors = []
        /*
        //while ((m = text.exec(/[\n]{3,}/g)) != null) {
        console.log(this.REGEX.exec(text))
        let m;
        while ((m = this.REGEX.exec(text)) != null) {
            errors.push(new ExceedLineBreak(text, m.index, m.index+m[0].length))
            //const lineCount = this.#getLineCount(text.slice(0, m.index+1)) + 1
            //errors.push(new ErrorData(lineCount, m.index, m.index+m[0].length, '３つ以上連続した改行があります。', '連続改行は２つ以下にしてください。１つならパラグラフ内改行、２つならパラグラフ分断です。'))
        }
        */
        /*
        for (const m of text.matchAll(this.REGEX)) {
            errors.push(new ExceedLineBreak(text, m.index, m.index+m[0].length))
        }
        console.log(errors)
        return errors
        */
        //const a = Array.from(text.matchAll(this.REGEX)).map(m=>new ExceedLineBreak(text, m.index, m.index+m[0].length))
        //console.log(a)
        return Array.from(text.matchAll(this.REGEX)).map(m=>new ExceedLineBreak(text, m.index, m.index+m[0].length))
    }
//    #getLineCount(text) { return (text.match(/\n/g) || []).length; }
//    method(text, start, end) { return '\n\n' }
    method() { return '\n\n' }
}
/*
class ErrorData {
    constructor(line, start, end, summary, details, method) {
        this.line = line
        this.start = start
        this.end = end
        this.summary = summary
        this.details = details
        this.method = method
    }
}
window.ErrorViewer = ErrorViewer
*/
window.JavelSyntaxError = JavelSyntaxError
})()
