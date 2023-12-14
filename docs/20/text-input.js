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
        //this.#parseBlock(e)
        this.#input(e)
    }
    #onCut(e) {
        console.log('CUT !!!!!!!', e)
        console.log(e.target.selectionStart, e.target.selectionEnd)
        const [index, blocks, deleteCount] = TextBlock.cutBlocks(e.target.selectionStart, e.target.selectionEnd, e.target.value.trim(), this.htmlViewer.parser.textBlocks)
        console.log(index, deleteCount, blocks)
        this.htmlViewer.htmls = this.htmlViewer.parser.pasteBlocks(index, blocks, deleteCount)
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
        const [index, blocks] = TextBlock.pasteBlocks(e.target.selectionStart, e.target.selectionEnd, this.#getClipboardText(e), e.target.value, this.htmlViewer.parser.textBlocks)
        this.htmlViewer.htmls = this.htmlViewer.parser.pasteBlocks(index, blocks)
        this.isPaste = true
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

        // ブロック削除を考慮すべき
        // 範囲選択中に削除・入力したら
        // 削除する文字に改行コードが含まれているなら

        // 同一ブロック内修正
        const [index, block] = TextBlock.selected(e.target.selectionStart, e.target.selectionEnd, e.target.value.trim())
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.setBlockText(index, block)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様

    }
    insert(i, s)
    #input(e) {
        // 選択範囲があり押下キーがDelete/BkSpであるなら、選択範囲が含まれるブロックを更新する
        // 選択範囲があり押下キーがDelete/BkSpでないなら、選択範囲が含まれるブロックを更新する

        // 選択範囲がなく押下キーがDelete/BkSpでないなら、現在ブロックを更新する
        // 選択範囲がなく押下キーがDelete/BkSpであり対象文字がブロック分断用改行コードなら、前後ブロックを更新する
        // 選択範囲がなく押下キーがDelete/BkSpであり対象文字がブロック分断用改行コード以外なら、現在ブロックを更新する
        if (this.#isSelected(e)) { // 範囲選択あり
            const inputedText = e.target.value.insert(e.target.selectionStart, e.data)
            console.log('inputedText:', inputedText)
            const [index, blocks, deleteCount] = TextBlock.cutBlocks(e.target.selectionStart, e.target.selectionEnd, e.target.value, this.htmlViewer.parser.textBlocks)
            console.log(index, deleteCount, blocks)
            this.htmlViewer.htmls = this.htmlViewer.parser.pasteBlocks(index, blocks, deleteCount)
            /*
            switch(e.inputType) {
                case 'deleteContentBackward': // BkSp
                case 'deleteContentForward': // DELETE
                    const [index, blocks, deleteCount] = TextBlock.cutBlocks(e.target.selectionStart, e.target.selectionEnd, e.target.value, this.htmlViewer.parser.textBlocks)
                    console.log(index, deleteCount, blocks)
                    this.htmlViewer.htmls = this.htmlViewer.parser.pasteBlocks(index, blocks, deleteCount)
                    break
                default: // 他（insertText）
                    break
            }
            */
        } else { // 範囲選択なし
            if (#isDeleteKey(e)) {
                // 何もしない
                if (0===start && 'deleteContentBackward'===e.inputType) { return } // 先頭でBkSp
                if (e.target.value.length-1===end&& 'deleteContentForward'===e.inputType) { return } // 末尾でDel
                // 対象文字がブロック分断用改行コードなら、前後ブロックを更新する
                if (this.#isDeleteBlockNewline(e)) {
                    const delTxt = this.#deletedText(e)
                    const [index, blocks, deleteCount] = TextBlock.cutBlocks(e.target.selectionStart, e.target.selectionEnd, delTxt, this.htmlViewer.parser.textBlocks)
                    console.log(index, deleteCount, blocks)
                    this.htmlViewer.htmls = this.htmlViewer.parser.pasteBlocks(index, blocks, deleteCount)
                    return
                }
                // 対象文字がブロック分断用改行コード以外なら、現在ブロックを更新する
            }
            // 選択範囲がなく押下キーがDelete/BkSpでないなら、現在ブロックを更新する
            /*
            else {
                // 同一ブロック内修正
                const [index, block] = TextBlock.selected(e.target.selectionStart, e.target.selectionEnd, e.target.value.trim())
                this.htmlViewer._htmls.val = [...this.htmlViewer.parser.setBlockText(index, block)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
            }
            */
            // 同一ブロック内修正
            const [index, block] = TextBlock.selected(e.target.selectionStart, e.target.selectionEnd, e.target.value.trim())
            this.htmlViewer._htmls.val = [...this.htmlViewer.parser.setBlockText(index, block)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
        }
        //const isSelected = (e.target.selectionStart !== e.target.selectionEnd)
        //const selectedText = e.target.value.slice(e.target.selectionStart, e.target.selectionEnd)
    }
    #isSelected(e) { return (e.target.selectionStart !== e.target.selectionEnd) }
    #isDeleteKey(e) {
        switch (e.inputType) {
            case 'deleteContentBackward': return true; // BkSp
            case 'deleteContentForward': return true; // DELETE
            default: return false
        }
    }
    #deletedText(e) {
        switch (e.inputType) {
            case 'deleteContentBackward': return e.target.value.remove(e.target.selectionStart-1); // BkSp
            case 'deleteContentForward': return e.target.value.remove(e.target.selectionEnd); // DELETE
        }
    }
    #getXXXXXXXXX(e) {
        const text = e.target.value
        const start = e.target.selectionStart
        const end = e.target.selectionEnd
    }

    #getDeleteChar(e) {
        switch (e.inputType) {
            case 'deleteContentBackward': return ((e.target.selectionStart < 1) ? '' : e.target.value.slice(e.target.selectionStart-1, e.target.selectionStart)); // BkSp
            case 'deleteContentForward': return (e.target.value.length-1 <= e.target.selectionEnd) ? '' : e.target.value.slice(e.target.selectionEnd+1, e.target.selectionEnd+2); // DELETE
        }
        return e.target.value.slice(e.target.selectionStart, e.target.selectionEnd)
        //throw new Error('この関数は削除時に使う想定です。')
    }
    #isDeleteBlockNewline(e) {
        if ('\n'===this.#getDeleteChar(e)) {
            switch (e.inputType) {
                case 'deleteContentBackward': // BkSp
                    const now = e.target.value.slice(e.target.selectionStart-1, e.target.selectionStart)
                    const prev = e.target.value.slice(e.target.selectionStart-2, e.target.selectionStart+1)
                    const next = e.target.value.slice(e.target.selectionEnd, e.target.selectionEnd+1)
                    if ('\n'===now || [prev, next].some(c=>'\n'===c)) { return true }
                    return false
                case 'deleteContentForward': // DELETE
                    const now = e.target.value.slice(e.target.selectionStart, e.target.selectionEnd+1)
                    const prev = e.target.value.slice(e.target.selectionStart-1, e.target.selectionStart)
                    const next = e.target.value.slice(e.target.selectionEnd+1, e.target.selectionEnd+2)
                    if ('\n'===now || [prev, next].some(c=>'\n'===c)) { return true }
                    return false
                default: return false
            }
        }
        return false

        switch (e.inputType) {
            case 'deleteContentBackward': return (('\n'===e.target.value.slice(e.target.selectionStart-1, e.target.selectionStart)) && ('\n'===e.target.value.slice(e.target.selectionEnd+1, e.target.selectionEnd+2))); // BkSp
            case 'deleteContentForward': return true; // DELETE
            default: return false
        }
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
