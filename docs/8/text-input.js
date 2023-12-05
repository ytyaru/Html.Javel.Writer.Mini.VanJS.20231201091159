(function(){
const { textarea } = van.tags
class TextInput {
    constructor(htmlViewer) { this.id='manuscript'; this.htmlViewer=htmlViewer; this.isComposing=false; }
    get element() { return textarea({id:this.id, placeholder:'原稿', style:()=>`box-sizing:border-box;`,
        oninput:(e)=>this.#onInput(e),
        oncompositionend:(e)=>this.htmlViewer.ja.val = e.target.value},
        this.htmlViewer.ja.val)
    }
    #onInput(e) {
        if (this.#isComposing(e)) { return }
        console.log(e)
        //this.htmlViewer.ja.val = e.target.value
        this.#parse(e)
    }
    // IME入力中判定 https://qiita.com/alt_yamamoto/items/8663d047a3794dd5605e
    #isComposing(e) {
        if (e.isComposing || e.key === 'Process' || e.keyCode === 229) { return true } // IME入力中
        if (['insertCompositionText', 'deleteCompositionText', 'insertFromComposition', 'deleteByComposition'].includes(e.inputType)) { return true }
        return false
    }
    #composition(e) {
        if ('compositionstart'===e.type) this.isComposing = true;
        if ('compositionend'===e.type) this.isComposing = false;
        // `window.isComposing === true`の場合はIME入力途中なので、何もせずreturnします。
        if (window.isComposing === true) return;

        if (event.type === 'compositionend') {
            console.log(event.target.value)
        }
    }
    #compositionEnd(e) { this.#parse(e) }
    #parse(e) {
        // 重い
//        this.htmlViewer.ja.val = e.target.value
        
        console.log(window.getSelection())
        console.log(window.getSelection().anchorNode)
        console.log(window.getSelection().getRangeAt(0).anchorNode)
        console.log(e.target)
//        console.log(e.target.getSelection())
//        console.log(e.target.getSelection().anchorNode)
//        console.log(e.target.getSelection().getRangeAt(0).anchorNode)
        console.log(e.target.selectionStart)
        console.log(e.target.selectionEnd)
        
        // 変更箇所だけパースしたい
        //   テキストブロック・インデックス取得
        //     textarea.selectionEndで何文字目かわかる
        //     それ以前のテキストにいくつブロックがあったか計算する（ブロックは2つ以上の連続した改行）
        const text = document.querySelector(`#${this.id}`).value.trim()
        const textBefore = text.slice(0, e.target.selectionEnd) // キャレット位置より前
        const textAfter = text.slice(e.target.selectionEnd) // キャレット位置より後
        //const selectedBlockIndex = (text.slice(0, e.target.selectionEnd).match(/[\n]{2,}/g) || []).length
        const selectedBlockIndex = (textBefore.match(/[\n]{2,}/g) || []).length
        console.log('selectedBlockIndex:', selectedBlockIndex )

        //       キャレット位置のブロックテキスト取得
        //         開始位置、終了位置
        //const blockStart = text.slice(0, e.target.selectionEnd).match(/[\n]{2,}/g) || [])
//        const blockStart = text.slice(0, e.target.selectionEnd).lastIndexOf('\n\n')
//        const blockEnd = text.slice(e.target.selectionEnd).indexOf('\n\n')
        const blockStart = textBefore.lastIndexOf('\n\n')
        const blockEnd = textAfter.indexOf('\n\n')
        //const block = text.slice(blockStart, blockEnd)
        //console.log(blockStart, blockEnd)
        console.log(blockStart, blockEnd+textBefore.length)
        const block = text.slice(((-1<blockStart) ? blockStart+2 : 0), (-1<blockEnd) ? blockEnd+textBefore.length : text.length)
        console.log(this.htmlViewer.parser.setBlockText(selectedBlockIndex, block))
        //this.htmlViewer._htmls.val = this.htmlViewer.parser.setBlockText(selectedBlockIndex, block)
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.setBlockText(selectedBlockIndex, block)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
//        this.htmlViewer._htmls = this.htmlViewer.parser.setBlockText(selectedBlockIndex, block)
    }
    #selectedBlockIndex() { return }


    setup() {
        this.htmlViewer._htmls.val = this.htmlViewer.parser.toHtmls(document.querySelector(`#${this.id}`).value)
//        this.htmlViewer._htmls = this.htmlViewer.parser.toHtmls(document.querySelector(`#${this.id}`).value)
        document.querySelector(`#${this.id}`).addEventListener('compositionend', this.#compositionEnd.bind(this))
        //document.querySelector(`#${this.id}`).addEventListener('compositionstart', this.#composition.bind(this))
        //document.querySelector(`#${this.id}`).addEventListener('compositionend', this.#composition.bind(this))
    }
}
window.TextInput = TextInput
})()
