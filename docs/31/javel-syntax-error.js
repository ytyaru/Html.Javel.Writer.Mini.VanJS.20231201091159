(function(){
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
class JavelSyntaxError {
    constructor() {
        this.id = 0
        this.name = 'JavelSyntaxError'
        this.summary = 'Javel構文エラーです。'
        this.details = 'チェックしたテキストにJavel構文エラーが含まれています。'
    }
}
class ExceedLineBreak extends JavelSyntaxError {
    constructor() {
        super()
        this.id = 1
        this.name = 'ExceedLineBreak'
        this.summary = '３つ以上連続した改行があります。'
        this.details = '連続改行は２つ以下にしてください。１つならパラグラフ内改行、２つならパラグラフ分断です。'
    }
    check(text) {
        text.match(/[\n]{3,}/g)

        const errors = []
        while ((m = text.exec(/[\n]{3,}/g)) != null) {
            const lineCount = this.#getLineCount(text.slice(0, m.index+1)) + 1
            
            errors.push(new ErrorData(lineCount, m.index, m.index+m[0].length, '３つ以上連続した改行があります。', '連続改行は２つ以下にしてください。１つならパラグラフ内改行、２つならパラグラフ分断です。'))
        }
    }
    #getLineCount(text) { return (text.match(/\n/g) || []).length; }
    method(text, start, end) { return '\n\n' }
}

JavelToo many line breaks.
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
})()
