(function(){
const { div, span, h1, p, br } = van.tags
class HtmlViewer {
    constructor() {
        this.parser = new JavelParser()
        this._id = 'html-viewer'
        this.ja = van.state('# 原稿\n\n　これは原稿です。自由に書いてください。\n\n　構文は３つです。見出し、パラグラフ、改行です。\n　見出しは行頭に#と半角スペースのあとに文字を書きます。\n　パラグラフは空行を挟みます。\n　改行は連続したテキスト間にひとつだけ改行を入れるとパラグラフ内で改行できます。\n\n　このテキストエリアに原稿を書くと、↓にHTMLとして表示されます。\n\n　↓のボタンを押すと横書き／縦書きを切替します。\n\n　HTML表示領域は長くなるとスクロールします。縦書きのときは横スクロールですが、マウスホイールでスクロールできます。\n\n# ｜見出し《heading》で《《強調》》と送《おく》り仮名《がな》\n\n　拡張構文としてemとrubyを実装しました。｜《｜《強調｜》｜》のようにすると傍点（圏点）がつきます。《《強調》》。また、漢字｜《かんじ｜》のように書くとルビが振れます。漢字《かんじ》。もし漢字以外の文字が含まれている箇所にルビを振りたいときは最初の文字にパイプをつけます。｜あいうえお《アイウエオ》のようになります。')
        this._htmls = van.state([])
        this.display = van.state('block')
        this.writingMode = van.state('vertical-rl')
        console.log(this.writingMode.val)
        this.textOrientation = van.state('upright')
        this.overflowX = van.state('auto')
        this.overflowY = van.state('hidden')

        this.textBlocks = vanX.reactive([])
    }
    makeTextBlocks(ja) { this.textBlocks = TextBlock.reactive(text) }

    get isShow() { return 'block'===this.display.val }
    set isShow(v) { this.display.val = (v) ? 'block' : 'none' }
    show() { this.display.val = 'block' }
    hide() { this.display.val = 'none' }
    //get htmls() { return this._htmls }
    get htmls() { return this._htmls.val }
    set htmls(v) { if (Type.isArray(v)) { this._htmls.val = [...v] } }// 反応させるには新しい配列にする必要ある。VanJSの仕様
    addHtmlBlock(htmlBlock) { this._htmls.val = [...this._htmls.val, htmlBlock] }
    get element() { return div({id:this._id, tabindex:0, 
            style:this.#style.bind(this),
            onwheel:(e)=>this.#onWheel(e),
            onkeydown:(e)=>this.#onKeydown(e),
        }, ()=>vanX.list(div, this.textBlocks, block=>this.parser.parse(block.val)))
        //}, ()=>div(this._htmls.val))
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
}
window.HtmlViewer = HtmlViewer
})()
