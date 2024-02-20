(function(){
const {div,h1,p,button} = van.tags
class SingleScreen {
    constructor() {
        this._children = van.state([])
        this._w = van.state('100%')
        this._h = van.state('100%')
        this._writingMode = van.state('horizontal-tb') // vertical-rl
        this._gridTemplateColumns = van.state('1fr')
        this._gridTemplateRows = van.state('1fr')
        this._overflowX = van.state('auto')
        this._overflowY = van.state('auto')
        this._textOrient = van.state('mixed') // upright
        this._border = van.state('solid 1px #000')
        this._wordBreak = van.state('normal')
        this._div = van.tags.div({onwheel:(e)=>this.#onWheel(e), style:()=>`padding:0;margin:0;overflow-y:scroll;display:grid;grid-template-columns:1fr;grid-template-rows:1fr;box-sizing:border-box;border:${this._border.val};writing-mode:${this._writingMode.val};overflow-x:${this._overflowX.val};overflow-y:${this._overflowY.val};text-orientation:${this._textOrient.val};word-break:${this._wordBreak.val};`}, ()=>div({style:`display:grid;grid-template-columns:${this._gridTemplateColumns.val};grid-template-rows:${this._gridTemplateRows.val};`}, this.children))
        //this._div = van.tags.div({onwheel:(e)=>this.#onWheel(e), style:()=>`padding:0;margin:0;overflow-y:scroll;display:grid;grid-template-columns:1fr;grid-template-rows:1fr;box-sizing:border-box;border:${this._border.val};writing-mode:${this._writingMode.val};overflow-x:${this._overflowX.val};overflow-y:${this._overflowY.val};text-orientation:${this._textOrient.val};word-break:${this._wordBreak.val};`}, ()=>div({style:`display:grid;grid-template-columns:1fr;grid-template-rows:1fr;`}, this.children))
    }
    get el() { return this._div }
    get children( ) { return this._children.val }
    set children(v) { this._children.val = v}
    get isVertical() { return !this.isHorizontal }
    get isHorizontal() { return ('horizontal-tb'===this._writingMode.val) }
    set isVertical(v) { this._writingMode.val = ((v) ? 'vertical-rl' : 'horizontal-tb') }
    set isHorizontal(v) { this._writingMode.val = ((v) ? 'horizontal-tb' : 'vertical-rl') }
//    set isVertical(v) { if(v) { this._writingMode = 'vertical-rl' }  }
//    set isHorizontal(v) { if(v) { this._writingMode = 'horizontal-tb' }  }
    toggleWritingMode() {
        this._writingMode.val = (('horizontal-tb'===this._writingMode.val) ? 'vertical-rl' : 'horizontal-tb')
        this.#setOverflow()
    }
    get gridTemplateColumns( ) { return this._gridTemplateColumns.val }
    set gridTemplateColumns(v) { this._gridTemplateColumns.val = v }
    get gridTemplateRows( ) { return this._gridTemplateRows.val }
    set gridTemplateRows(v) { this._gridTemplateRows.val = v }
    #setOverflow() {
        if ('horizontal-tb'===this._writingMode.val) {
            this._overflowX.val = 'hidden'
            this._overflowY.val = 'auto'
            this._textOrient.val = 'mixed'
        } else {
            this._overflowX.val = 'auto'
            this._overflowY.val = 'hidden'
            this._textOrient.val = 'upright'
        }
    }
    set wordBreak(val) { if (['normal','break-all','keep-all','break-word'].some(v=>v===val)) { this._wordBreak.val = val } }
    get hasScrollBar() { return ((this.el.isHorizontal) ? this.el.scrollHeight > this.el.this.height : this.el.scrollWidth > this.el.this.width) }
    get scrollSize() { return ((this.el.isHorizontal) ? this.el.offsetHeight - this.el.clientHeight : this.el.offsetWidth - this.el.clientWidth) }
    #onWheel(e) {
        if ('vertical-rl'===this._writingMode.val) {
            if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
            this._div.scrollLeft += e.deltaY;
            e.preventDefault();
        }
    }
}
class DoubleScreen {
    constructor() {
        this._left = new SingleScreen()
        this._right = new SingleScreen()
        this._gridTemplateColumns = van.state('48% 4% 48%')
        this._gridTemplateRows = van.state(document.body.clientHeight)
        this._div = van.tags.div({style:()=>`padding:0;margin:0;box-sizing:border-box;display:grid;grid-template-columns:${this._gridTemplateColumns.val};grid-template-rows:${this._gridTemplateRows.val};`}, this._left.el, this._right.el)
    }
    get el() { return this._div }
    get left() { return this._left }
    get right() { return this._right }
    resize() { this.#setGridTemplate() }
    #setGridTemplate() {
        const screenSize = Math.floor(this.#longEdgeSize * 0.48)
        const centerSize = Math.floor(Math.max(18, this.#longEdgeSize * 0.04))
        const longEdgeGrid = `${screenSize}px ${centerSize}px ${screenSize}px`
        const shortEdgeGrid = `${Math.floor(this.#shortEdgeSize)}px`
        this._gridTemplateColumns.val = ((this.#isLandscape) ? longEdgeGrid : shortEdgeGrid)
        this._gridTemplateRows.val = ((this.#isLandscape) ? shortEdgeGrid : longEdgeGrid)
        console.log(this._gridTemplateColumns.val)
        console.log(this._gridTemplateRows.val)
//        this._left.children = [p('isLandscape:', this.#isLandscape), p('body.client:', document.body.clientWidth, ',', document.body.clientHeight), p('documentElement.client:', document.documentElement.clientWidth, ',', document.documentElement.clientHeight), p('window.inner:', window.innerWidth, ',', window.innerHeight), p('long,short:', this.#longEdgeSize, ',', this.#longEdgeSize), p('gridTemplateColumns:', this._gridTemplateColumns.val), p('gridTemplateRows:', this._gridTemplateRows.val)]
    }
    get #longEdgeSize() { return Math.max(this.#width, this.#height) }
    get #shortEdgeSize() { return Math.min(this.#width, this.#height) }
    get #width() { return document.body.clientWidth; }
    get #height() { return document.documentElement.clientHeight; }
    get #isLandscape() { return (document.body.clientHeight < document.body.clientWidth) }
    get #isPortrate() { return !this.#isLandscape }
}
class TripleScreen {
    constructor() {
        this._left = new SingleScreen()
        this._right = new SingleScreen()
        this._center = new SingleScreen()
        this._gridTemplateColumns = van.state('48% 4% 48%')
        this._gridTemplateRows = van.state(document.body.clientHeight)
        this._div = van.tags.div({style:()=>`padding:0;margin:0;box-sizing:border-box;display:grid;grid-template-columns:${this._gridTemplateColumns.val};grid-template-rows:${this._gridTemplateRows.val};`}, this._left.el, this._center.el, this._right.el)
    }
    get el() { return this._div }
    get left() { return this._left }
    get right() { return this._right }
    get center() { return this._center }
    resize() {
        this.#setGridTemplate()
        this._center.wordBreak = ((this.#isLandscape) ? 'break-all' : 'normal')
    }
    #setGridTemplate() {
        const screenSize = Math.floor(this.#longEdgeSize * 0.48)
        const centerSize = Math.floor(Math.max(18, this.#longEdgeSize * 0.04))
        const longEdgeGrid = `${screenSize}px ${centerSize}px ${screenSize}px`
        const shortEdgeGrid = `${Math.floor(this.#shortEdgeSize)}px`
        this._gridTemplateColumns.val = ((this.#isLandscape) ? longEdgeGrid : shortEdgeGrid)
        this._gridTemplateRows.val = ((this.#isLandscape) ? shortEdgeGrid : longEdgeGrid)
        console.log(this._gridTemplateColumns.val)
        console.log(this._gridTemplateRows.val)
        this.center.isVertical = this.#isLandscape
        this.center.gridTemplateRows = `${centerSize}px`
        //this.center.gridTemplateRows = `${this.#height}px`
        console.error('this.center.isVertical:', this.center.isVertical, this.center._writingMode.val, this.center.gridTemplateColumns)
        console.error(this.#isLandscape, this.#width, this.#height)
//        this._left.children = [p('isLandscape:', this.#isLandscape), p('body.client:', document.body.clientWidth, ',', document.body.clientHeight), p('documentElement.client:', document.documentElement.clientWidth, ',', document.documentElement.clientHeight), p('window.inner:', window.innerWidth, ',', window.innerHeight), p('long,short:', this.#longEdgeSize, ',', this.#longEdgeSize), p('gridTemplateColumns:', this._gridTemplateColumns.val), p('gridTemplateRows:', this._gridTemplateRows.val)]
    }
    get #longEdgeSize() { return Math.max(this.#width, this.#height) }
    get #shortEdgeSize() { return Math.min(this.#width, this.#height) }
    get #width() { return document.body.clientWidth; }
    get #height() { return document.documentElement.clientHeight; }
    get #isLandscape() { return (this.#height < this.#width) }
    get #isPortrate() { return !this.#isLandscape }
}
window.layout ||= {}
window.layout.Single = SingleScreen 
window.layout.Double = DoubleScreen
window.layout.Triple = TripleScreen
})()
