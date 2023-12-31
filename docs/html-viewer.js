(function(){
const { div, span, h1, p, br } = van.tags
class HtmlViewer {
    constructor() {
        this._id = 'html-viewer'
        this.ja = van.state('# 原稿\n\n　これは原稿です。自由に書いてください。\n\n　構文は３つです。見出し、パラグラフ、改行です。\n　見出しは行頭に#と半角スペースのあとに文字を書きます。\n　パラグラフは空行を挟みます。\n　改行は連続したテキスト間にひとつだけ改行を入れるとパラグラフ内で改行できます。\n\n　このテキストエリアに原稿を書くと、↓にHTMLとして表示されます。\n\n　↓のボタンを押すと横書き／縦書きを切替します。\n\n　HTML表示領域は長くなるとスクロールします。縦書きのときは横スクロールですが、マウスホイールでスクロールできます。')
        this._htmls = van.derive(this.#jaToHtmls.bind(this))
        this.writingMode = van.state('vertical-rl')
        console.log(this.writingMode.val)
        this.textOrientation = van.state('upright')
        this.overflowX = van.state('auto')
        this.overflowY = van.state('hidden')
    }
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
    #style() { console.log(this.writingMode.val);return `writing-mode:${this.writingMode.val};text-orientation:${this.textOrientation.val};box-sizing:border-box;overflow-x:${this.overflowX.val};overflow-y:${this.overflowY.val};user-select:none;` }
    #jaToHtmls() {
        console.log('derive() htmls', this)
        const lines = this.ja.val.trim().split(/\r?\n/)
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
}
window.HtmlViewer = HtmlViewer
})()
