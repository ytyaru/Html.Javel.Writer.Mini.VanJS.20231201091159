(function(){
const { div, span, h1, p, a, br, button, table, tr, th, td, details, summary } = van.tags
class LoadingViewer {
    constructor() {
        this._id = 'loading-viewer'
        this._htmls = van.state(['Loading'])
        this.display = van.state('flex')
        this.writingMode = van.state('vertical-rl')
        console.log(this.writingMode.val)
        this.textOrientation = van.state('upright')
        this.overflowX = van.state('auto')
        this.overflowY = van.state('hidden')
    }
    get isShow() { return 'none'!==this.display.val }
    set isShow(v) { this.display.val = (v) ? 'flex' : 'none' }
    show() { this.display.val = 'flex' }
    hide() { this.display.val = 'none' }
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
    //#style() { console.log(this.writingMode.val);return `display:${this.display.val};writing-mode:${this.writingMode.val};text-orientation:${this.textOrientation.val};box-sizing:border-box;overflow-x:${this.overflowX.val};overflow-y:${this.overflowY.val};user-select:none;` }
    #style() { console.log(this.writingMode.val);return `display:${this.display.val};justify-content:center;align-items:center;writing-mode:${this.writingMode.val};text-orientation:${this.textOrientation.val};box-sizing:border-box;overflow-x:${this.overflowX.val};overflow-y:${this.overflowY.val};user-select:none;` }
    makeHtml(textarea, errors) {
        this.htmls = [
            this.#makeSummary(errors),
            this.#makeAllFixButton(errors, textarea),
            this.#makeErrorTable(errors, textarea),
        ]
    }
    #makeSummary(errors) { return p(`${errors.length}つのエラーがあります。すべて修正するまでプレビューできません。`) }
    #makeAllFixButton(errors, textarea) {
        const hasMethodCount = errors.filter(e=>this.#getMethodNames(e).includes('method')).length
        if (0===hasMethodCount) { return '' }
        const text = (hasMethodCount===errors.length) ? '全件自動修正する' : `できるだけ自動修正する　${hasMethodCount}/${errors.length}`
        return a({href:'javascript:void(0);', onclick:()=>{
            for (let i=0; i<errors.length; i++) {
                const diff = this.#fixError(textarea, errors[i], false)
                this.#resetErrorStart(errors, i, diff)
            }
            this.#updateErrors(textarea)
        }}, text)
    }
    #resetErrorStart(errors, idx, diff) { for (let i=idx; i<errors.length; i++) { errors[i].start += diff } }
    #getMethodNames(obj) {
        const getOwnMethods = (obj) => Object.entries(Object.getOwnPropertyDescriptors(obj))
            .filter(([name, {value}]) => typeof value === 'function' && name !== 'constructor')
            .map(([name]) => name)
        const _getMethods = (o, methods) => o === Object.prototype ? methods : _getMethods(Object.getPrototypeOf(o), methods.concat(getOwnMethods(o)))
        return _getMethods(obj, [])
    }
    #makeErrorTable(errors, textarea) {
        return table(
            tr(th('箇所'), th('内容'), th('修正案')),
            this.#makeErrorTrs(errors, textarea).flat(),
        )
    }
    #makeErrorTrs(errors, textarea) {
        const trs = []
        for (let e of errors) {
            const line = this.#getLineCount(textarea.value.slice(0, e.start))
            trs.push(tr(
                td(a({href:'javascript:void(0);', onclick:()=>this.#selectError(textarea, e)}, line)), 
                td(details(summary(e.constructor.summary), e.constructor.details)), 
                td(a({href:'javascript:void(0);', onclick:()=>this.#fixError(textarea, e)}, e.constructor.methodSummary))))
        }
        return trs
    }
    #getLineCount(text) { return (text.match(/\n/g) || []).length + 1; }
    #selectError(textarea, error) { textarea.setSelectionRange(error.start, error.end); textarea.focus(); }
    #fixError(textarea, error, isUpdate=true) {
        console.log('#fixError():', error)
        this.#selectError(textarea, error)
        const afterText = error.method()
        const beforeLen = error.end - error.start
        const afterLen = afterText.length
        const diff = afterLen - beforeLen
        textarea.setRangeText(afterText, error.start, error.end)
        console.log('自動修正しました！')
        if (isUpdate) { this.#updateErrors(textarea) }
        return diff
    }
    #updateErrors(textarea) {
        console.log('#updateErrors()')
        const errors = JavelSyntaxError.check(textarea.value)
        console.log(errors)
        this.makeHtml(textarea, errors)
        this.isShow = (0 < errors.length)
        this.htmlViewer.isShow = !this.isShow
        console.log(this.isShow, this.htmlViewer.isShow)
    }
}
window.LoadingViewer = LoadingViewer
})()
