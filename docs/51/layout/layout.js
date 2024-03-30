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
        this._fontSize = van.state(16)
        //this._div = van.tags.div({onwheel:(e)=>this.#onWheel(e), style:()=>`padding:0;margin:0;font-size:${this._fontSize.val}px;display:grid;grid-template-columns:1fr;grid-template-rows:1fr;box-sizing:border-box;border:${this._border.val};writing-mode:${this._writingMode.val};overflow-x:${this._overflowX.val};overflow-y:${this._overflowY.val};text-orientation:${this._textOrient.val};word-break:${this._wordBreak.val};`}, ()=>div({style:`display:grid;grid-template-columns:${this._gridTemplateColumns.val};grid-template-rows:${this._gridTemplateRows.val};`}, this.children))
        this._div = van.tags.div({onwheel:(e)=>this.#onWheel(e), style:()=>`padding:0;margin:0;font-size:${this._fontSize.val}px;display:grid;display:grid;grid-template-columns:1fr;grid-template-rows:${this._gridTemplateRows.val};box-sizing:border-box;border:${this._border.val};writing-mode:${this._writingMode.val};overflow-x:${this._overflowX.val};overflow-y:${this._overflowY.val};text-orientation:${this._textOrient.val};word-break:${this._wordBreak.val};`}, ()=>div({style:`padding:0;margin:0;font-size:${this._fontSize.val}px;display:grid;display:grid;grid-template-columns:${this._gridTemplateColumns.val};grid-template-rows:${this._gridTemplateRows.val};box-sizing:border-box;`}, this.children))
        //this._div = van.tags.div({onwheel:(e)=>this.#onWheel(e), style:()=>`padding:0;margin:0;overflow-y:scroll;display:grid;grid-template-columns:1fr;grid-template-rows:1fr;box-sizing:border-box;border:${this._border.val};writing-mode:${this._writingMode.val};overflow-x:${this._overflowX.val};overflow-y:${this._overflowY.val};text-orientation:${this._textOrient.val};word-break:${this._wordBreak.val};`}, ()=>div({style:`display:grid;grid-template-columns:1fr;grid-template-rows:1fr;`}, this.children))
    }
    get el() { return this._div }
    get children( ) { return this._children.val }
    set children(v) { this._children.val = v; this.resize(); }
    get isVertical() { return !this.isHorizontal }
    get isHorizontal() { return ('horizontal-tb'===this._writingMode.val) }
    set isVertical(v) { this._writingMode.val = ((v) ? 'vertical-rl' : 'horizontal-tb'); this.resize(); }
    set isHorizontal(v) { this._writingMode.val = ((v) ? 'horizontal-tb' : 'vertical-rl'); this.resize(); }
    toggleWritingMode() {
        this._writingMode.val = (('horizontal-tb'===this._writingMode.val) ? 'vertical-rl' : 'horizontal-tb')
        this.#setOverflow()
        this.resize()
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
        this.#setFontSize()
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
    resize() { this.#setFontSize() }
    #setFontSize() { console.log('this.el:',this.el);this._fontSize.val = Font.calc(this.el); this.#setFontSizeElements(); }
    #setFontSizeElements() {
        console.log('#setFontSizeElements()')
        //for (let el of this.el.querySelectorAll('textarea,select,input,button,label,legend')) {
        for (let el of this.el.querySelectorAll('*[data-sid][data-eid]')) {
            const tagName = el.tagName.toLowerCase()
            if (!'div,textarea,select,input,button,label,legend'.split(',').some(v=>v===tagName)) { continue }
            console.error(tagName)
            Css.set('font-size', `${this._fontSize.val}px`, el)
            console.log(el, this._fontSize.val)
            if ('textarea'===tagName || ('div'===tagName)) {
                Css.set('line-height', '1.7em', el)
                Css.set('letter-spacing', '0.05em', el)
            }
        }
    }
}
class GridScreen {
    constructor() {
        this._children = van.state([])
        this._writingMode = van.state('horizontal-tb') // vertical-rl
        this._gridTemplateColumns = van.state('1fr')
        this._gridTemplateRows = van.state('1fr')
        this._overflowX = van.state('auto')
        this._overflowY = van.state('auto')
        this._textOrient = van.state('mixed') // upright
        this._border = van.state('solid 1px #000')
        this._wordBreak = van.state('normal')
        this._div = van.tags.div({onwheel:(e)=>this.#onWheel(e), style:()=>`padding:0;margin:0;overflow-y:scroll;display:grid;grid-template-columns:${this._gridTemplateColumns.val};grid-template-rows:${this._gridTemplateRows.val};box-sizing:border-box;border:${this._border.val};writing-mode:${this._writingMode.val};overflow-x:${this._overflowX.val};overflow-y:${this._overflowY.val};text-orientation:${this._textOrient.val};word-break:${this._wordBreak.val};`}, this._children.val)
    }
    get el() { return this._div }
    get children( ) { return this._children.val }
    set children(v) { this._children.val = v; this.#setGrid(); }
    get isVertical() { return !this.isHorizontal }
    get isHorizontal() { return ('horizontal-tb'===this._writingMode.val) }
    set isVertical(v) { this._writingMode.val = ((v) ? 'vertical-rl' : 'horizontal-tb'); this.#setGrid(); }
    set isHorizontal(v) { this._writingMode.val = ((v) ? 'horizontal-tb' : 'vertical-rl'); this.#setGrid(); }
//    set isVertical(v) { if(v) { this._writingMode = 'vertical-rl' }  }
//    set isHorizontal(v) { if(v) { this._writingMode = 'horizontal-tb' }  }
    toggleWritingMode() {
        this._writingMode.val = (('horizontal-tb'===this._writingMode.val) ? 'vertical-rl' : 'horizontal-tb')
        this.#setOverflow()
        this.#setGrid()
    }
    get gridTemplateColumns( ) { return this._gridTemplateColumns.val }
    set gridTemplateColumns(v) { this._gridTemplateColumns.val = v }
    get gridTemplateRows( ) { return this._gridTemplateRows.val }
    set gridTemplateRows(v) { this._gridTemplateRows.val = v }
    #setGrid() {
        this._gridTemplateColumns.val = `repeat(${this._children.val.length}, 1fr)`
        this._gridTemplateRows.val = `${((this.isHorizontal) ? document.documentElement.clientHeight : document.body.clientWidth)}px`
    }
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
        //this._center = new GridScreen()
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
        this.left.resize()
        this.right.resize()
        this.center.resize()
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
        console.log(this.center.gridTemplateColumns)
        console.log(this.center.gridTemplateRows)
        console.log(this.center.children[0], this.center.children[0].width, this.center.children[0].height)
        //this.center.gridTemplateRows = `${centerSize}px`
        //this.center.gridTemplateRows = `${this.#height}px`
        //console.error('this.center.isVertical:', this.center.isVertical, this.center._writingMode.val, this.center.gridTemplateColumns)
        //console.error(this.#isLandscape, this.#width, this.#height)
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
