(function(){
const { textarea } = van.tags
class TextInput {
    constructor(htmlViewer) { this.id='manuscript'; this.htmlViewer=htmlViewer; this.isComposing=false; this.isCut=false; this.isPaste=false; }
    get element() { return textarea({id:this.id, placeholder:'原稿', style:()=>`box-sizing:border-box;`,
        oninput:(e)=>this.#onInput(e),
        oncut:(e)=>this.#onCut(e),
        onpaste:(e)=>this.#onPaste(e),
        oncompositionend:(e)=>this.htmlViewer.ja.val = e.target.value},
        this.htmlViewer.ja.val)
    }
    #onInput(e) {
        console.log('INPUT !!!!!!!!!')
        if (this.#isComposing(e)) { return }
        if (this.isCut) { this.isCut=false; return; }
        if (this.isPaste) { this.isCut=false; return; }
        console.log(e)
        this.#parseBlock(e)
    }
    #onCut(e) {
        console.log('CUT !!!!!!!', e)
        console.log(e.target.selectionStart, e.target.selectionEnd)
        const [index, blocks] = TextBlock.cutBlocks(e.target.selectionStart, e.target.selectionEnd, e.target.value.trim(), this.htmlViewer.parser.textBlocks)
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.pasteBlocks(index, blocks)]
        this.isCut = true
    }
    #getClipboardText(e) {
        if (e.clipboardData && e.clipboardData.getData) { return e.clipboardData.getData('text/plain') } // 他
        else if (window.clipboardData && window.clipboardData.getData) { return window.clipboardData.getData('Text') } // IE
        throw new Error('clipboardData API がありません。')
    }
    #onPaste(e) {
        console.log('PASTE !!!!!!!!!')
        console.log(e.target.selectionStart, e.target.selectionEnd)
        const [index, blocks] = TextBlock.pasteBlocks(e.target.selectionStart, e.target.selectionEnd, this.#getClipboardText(e), e.target.value.trim(), this.htmlViewer.parser.textBlocks)
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.pasteBlocks(index, blocks)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
        this.isPaste = true
        /*
        //const [index, _] = TextBlock.selected(e.target.selectionEnd, e.target.value.trim())
        const [index, _] = TextBlock.selected(e.target.selectionStart, e.target.selectionEnd, e.target.value.trim())
        console.log(`index: ${index}`)

        // ペースト位置のブロックと、その次のブロックの範囲のテキストを取得する。それらとペーストするテキストを結合してTextBlock.fromText()でブロック配列にして挿入する。これによって面倒な改行によるブロックの上書きや挿入といった個別判定が不要になる。
        const text = e.target.value
        const textFront = e.target.value.slice(0, e.target.selectionStart)
        const textBack = e.target.value.slice(e.target.selectionEnd)
        console.log(textFront)
        console.log(textBack)

        const pasteText = this.#getClipboardText(e)
        console.log('pasteText:', pasteText, (pasteText.match(/[\n]/g) || []).length)
//        const pasteBlocks = TextBlock.fromText(pasteText)
        const blockFront = textFront.slice((-1===textFront.lastIndexOf('\n\n')) ? 0 : textFront.lastIndexOf('\n\n')+2)
        const blockBack = textBack.slice(0, (-1===textBack.indexOf('\n\n')) ? 0 : textBack.indexOf('\n\n'))
        console.log('blockFront:', blockFront)
        console.log('blockBack:', blockBack)
        console.log('blockBack.trimLine():', blockBack.trimLine())

        const nextBlockText = (index+1<this.htmlViewer.parser.textBlocks.length) ? this.htmlViewer.parser.textBlocks[index+1] : ''
        console.log('nextBlockText:', nextBlockText)
        
        console.log('blockBack===nextBlockText:', blockBack===nextBlockText)
        console.log('blockBack.trimLine()===nextBlockText:', blockBack.trimLine()===nextBlockText)
        console.log('blockBack.trimLine()==nextBlockText:', blockBack.trimLine()==nextBlockText)
        console.log((blockFront + pasteText + blockBack) + '\n\n' + nextBlockText)
        console.log((blockFront + pasteText + blockBack) + ((blockBack===nextBlockText) ? '' : '\n\n' + nextBlockText))
        console.log((blockFront + pasteText + blockBack) + ((blockBack.trimLine()===nextBlockText) ? '' : '\n\n' + nextBlockText))
        console.log((blockFront + pasteText + blockBack) + ((blockBack.trimLine()==nextBlockText) ? '' : '\n\n' + nextBlockText))
        const pasteBlocks = TextBlock.fromLines(((blockFront + pasteText + blockBack) + ((blockBack.trimLine()==nextBlockText) ? '' : '\n\n' + nextBlockText)).split(/\r?\n/))
        console.log(pasteBlocks)
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.pasteBlocks(index, pasteBlocks)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
        this.isPaste = true
        */
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
        if (window.isComposing === true) return; // IME入力途中なので何もしない
        if (event.type === 'compositionend') {
            console.log(event.target.value)
        }
    }
    #compositionEnd(e) { this.#parseBlock(e) }
    #parseBlock(e) {
        console.log(window.getSelection())
        console.log(window.getSelection().anchorNode)
        console.log(window.getSelection().getRangeAt(0).anchorNode)
        console.log(e.target)
//        console.log(e.target.getSelection())
//        console.log(e.target.getSelection().anchorNode)
//        console.log(e.target.getSelection().getRangeAt(0).anchorNode)
        console.log(e.target.selectionStart)
        console.log(e.target.selectionEnd)

        const [index, block] = TextBlock.selected(e.target.selectionStart, e.target.selectionEnd, e.target.value.trim())
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.setBlockText(index, block)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
    }
    setup() {
        this.htmlViewer._htmls.val = this.htmlViewer.parser.toHtmls(document.querySelector(`#${this.id}`).value)
        document.querySelector(`#${this.id}`).addEventListener('compositionend', this.#compositionEnd.bind(this))
        //document.querySelector(`#${this.id}`).addEventListener('compositionstart', this.#composition.bind(this))
        //document.querySelector(`#${this.id}`).addEventListener('compositionend', this.#composition.bind(this))
    }
}
window.TextInput = TextInput
})()
