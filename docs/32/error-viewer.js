(function(){
const { div, span, h1, p, a, br, button, table, tr, th, td, details, summary } = van.tags
class ErrorViewer {
    constructor() {
        this.parser = new JavelParser()
        this._id = 'error-viewer'
        //this._htmls = van.state([])
        this._htmls = van.state(['Nつのエラーがあります。すべて修正するまでプレビューできません。'])
        this.display = van.state('none')
        this.writingMode = van.state('vertical-rl')
        console.log(this.writingMode.val)
        this.textOrientation = van.state('upright')
        this.overflowX = van.state('auto')
        this.overflowY = van.state('hidden')
    }
    get htmls() { return this._htmls }
    set htmls(v) { if (Type.isArray(v)) { this._htmls.val = [...v] } }// 反応させるには新しい配列にする必要ある。VanJSの仕様
    get element() { return div({id:this._id, tabindex:0, 
            style:this.#style.bind(this),
            onwheel:(e)=>this.#onWheel(e),
            onkeydown:(e)=>this.#onKeydown(e),
        }, ()=>div(this._htmls.val))
    }
    toggleWritingMode() {
        this.writingMode.val= (this.isVertical) ? 'horizontal-tb' : 'vertical-rl'
        this.overflowX.val = (this.isVertical) ? 'auto' : 'hidden'
        this.overflowY.val = (this.isVertical) ? 'hidden' : 'auto'
        this.textOrientation.val = (this.isVertical) ? 'upright' : 'mixed'
    }
    get isVertical() { return ('vertical-rl'===this.writingMode.val) }
    get isHorizontal() { return ('horizontal-tb'===this.writingMode.val) }
    #onWheel(e) {
        if ('vertical-rl'===this.writingMode.val) {
            if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
            const target = document.querySelector('#html-viewer')
            target.scrollLeft += e.deltaY;
            e.preventDefault();
        }
    }
    #onKeydown(e) {
        if (['Right','Left','Up','Down'].some((key)=>`Arrow${key}`===e.code)) {
            if ('ArrowUp'===e.code) e.target.scrollTop -= 96
            if ('ArrowDown'===e.code) e.target.scrollTop += 96
            if ('ArrowLeft'===e.code) e.target.scrollLeft -= 96
            if ('ArrowRight'===e.code) e.target.scrollLeft += 96
            e.preventDefault()
        }
    }
    // html-viewerは縦書きでHTML表示したいからdiv要素にする。でもdiv要素はfocusが当たらない。なのでtabindex=0を設定した。標準のキー操作だと矢印の上を押し続けるとbody要素へフォーカスが飛んでしまう。なのでキャレットを排除すべくuser-select:none;にして、かつキーイベントでスクロール操作するよう実装した。
    #style() { console.log(this.writingMode.val);return `display:${this.display.val};writing-mode:${this.writingMode.val};text-orientation:${this.textOrientation.val};box-sizing:border-box;overflow-x:${this.overflowX.val};overflow-y:${this.overflowY.val};user-select:none;` }
    makeHtml(textarea, errors) {
        //const errors = JavelSyntaxError.check(textarea.value)
        this.htmls = [
            this.#makeSummary(errors),
            this.#makeAllFixButton(errors, textarea),
            this.#makeErrorTable(errors, textarea),
        ]
    }
    #makeSummary(errors) { return p(`${errors.length}つのエラーがあります。すべて修正するまでプレビューできません。`) }
    #makeAllFixButton(errors, textarea) { return button({
        onclick:(e)=>alert('できるだけ自動修正する'),
        }, 'できるだけ自動修正する') }
    #makeErrorTable(errors, textarea) {
        return table(
            tr(th('箇所'), th('内容'), th('修正案')),
            this.#makeErrorTrs(errors, textarea).flat(),
        )
    }
    #makeErrorTrs(errors, textarea) {
        const trs = []
        //errors.map(e=>tr(td(e), td(e), td(e)))
        let s = 0
        for (let e of errors) {
            //const line = this.#getLineCount(textarea.value.slice(s, e.start))
            const line = this.#getLineCount(textarea.value.slice(0, e.start))
            trs.push(tr(
                td(a({href:'javascript:void(0);', onclick:()=>this.#selectError(textarea, e)}, line)), 
                td(details(summary(e.constructor.summary), e.constructor.details)), 
                td(a({href:'javascript:void(0);', onclick:()=>this.#selectError(textarea, e)}, e.constructor.methodSummary))))
            s = e.end + 1
        }
        return trs
    }
    #getLineCount(text) { return (text.match(/\n/g) || []).length + 1; }
    //#selectError(textarea, error) { textarea.setSelectionRange(error.start, error.end) }
    #selectError(textarea, error) { console.log('XXXXXXXXXXXXXXXXX', textarea, error); textarea.setSelectionRange(error.start, error.end); textarea.focus(); }
    //#selectError(textarea, error) { console.log('XXXXXXXXXXXXXXXXX', textarea, error); textarea.setSelectionRange(error.start, error.end); textarea.value = '';}
    #fixError(textarea, error) {

    }
    checkError(errors) {
        while ((m = text.exec(/[\n]{3,}/g)) != null) {

        }
    }
}
window.ErrorViewer = ErrorViewer
})()
