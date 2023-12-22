(function(){
const { textarea } = van.tags
class TextInput {
    constructor(htmlViewer) { this.id='manuscript'; this.htmlViewer=htmlViewer; this.isComposing=false; this.isCut=false; this.isPaste=false; this.selectedText=null; this.isSelectedEdit=false; this.deletedText=null; this.isBanNewLine=false; }
    get element() { return textarea({id:this.id, placeholder:'原稿', style:()=>`box-sizing:border-box;`,
        oninput:(e)=>this.#onInput(e),
        oncut:(e)=>this.#onCut(e),
        onpaste:(e)=>this.#onPaste(e),
        oncompositionend:(e)=>this.htmlViewer.ja.val = e.target.value,
        onkeydown:(e)=>this.#onKeydown(e)},
        this.htmlViewer.ja.val)
    }
    #onInput(e) {
        console.log('INPUT !!!!!!!!!', e)
        if (this.#isComposing(e)) { return }
        if (this.isCut) { this.isCut=false; return; }
        if (this.isPaste) { this.isCut=false; return; }
        if (this.isSelectedEdit) { this.isSelectedEdit=false; return; }
        if (this.isBanNewLine) { this.isBanNewLine=false; e.preventDefault(); return; }
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
    #onKeydown(e) {
        console.log('keydown:', e)
        //const [text, start, end] = [e.target.value, e.target.selectionStart, e.target.selectionEnd]
        //const isSelected = (0 < this.selectedText.length)
        const isSelected = ((e.target.selectionStart !== e.target.selectionEnd) && 0 !== e.target.selectionStart)
        const [text, start, end] = [e.target.value, 
                                    e.target.selectionStart - (!isSelected && ('Backspace'===e.key) ? 1 : 0), 
                                    e.target.selectionEnd + ((!isSelected && 'Delete'===e.key) ? 1 : 0)]
        console.log(start, end, text)
        this.selectedText = text.slice(start, end)
        console.log('selectedText:', this.selectedText)
        console.log('selectedText:', text.slice(start, end))
        console.log('selectedText:', text.slice(start, end+1))
        console.log('selectedText:', text.slice(start, end+2))
        console.log('selectedText:', text.slice(start, end-1))
        switch (e.key) {
            case 'Delete':
            case 'Backspace':
            case 'Enter':
                if (isSelected) {
                    console.log('範囲選択あり')
                    console.log('Enter===e.key:', 'Enter'===e.key)
                    console.log('1===(end-start):', 1===(end-start))
                    console.log('((0<start && \\n=== text.slice(start-1, start)):', ((0<start && '\n'=== text.slice(start-1, start))))
                    console.log('(end<text.length-1 && \\n===text.slice(end, end+1)):', (end<text.length-1 && '\n'===text.slice(end, end+1) ))
                    if ('Enter'===e.key && 1===(end-start) && ((0<start && '\n'=== text.slice(start-1, start)) || (end<text.length-1 && '\n'===text.slice(end, end+1)))) { console.log('改行をEnterで置き換えたとき、何もしない'); return }
                    //const [index, blocks, deleteCount] = TextBlock.cutBlocks(e.target.selectionStart, e.target.selectionEnd, ('Enter'===e.key) ? e.target.value.insert(end, '\n') : e.target.value, this.htmlViewer.parser.textBlocks)
                    const [index, blocks, deleteCount] = TextBlock.cutBlocks(e.target.selectionStart, e.target.selectionEnd, e.target.value, this.htmlViewer.parser.textBlocks)
                    console.log(index, deleteCount, blocks)
                    this.htmlViewer.htmls = this.htmlViewer.parser.pasteBlocks(index, blocks, deleteCount)
                    this.isSelectedEdit = true
                    return
                } else {
                    console.log('範囲選択なし')
//                    if ('Delete'===e.key) { this.selectedText = text.slice(start-1, start) }
//                    if ('Backspace'===e.key) { this.selectedText = text.slice(end-1, end) }
                    // 何もしない
                    if (0===start && 'Backspace'===e.key) { this.isSelectedEdit=true; return } // 先頭でBkSp
                    if (e.target.value.length-1===end && 'Delete'===e.key) { this.isSelectedEdit=true; return } // 末尾でDel
                    // ２つ以上の連続した改行は入力禁止（ENTER押下＆前後１｜前２｜後２つ改行有なら何もしない）
                    if ('Enter'===e.key && (
                        (0<start && end<text.length-1 && '\n'=== text.slice(start-1, start) && '\n'===text.slice(end, end+1)) ||
                        (1<start && '\n'=== text.slice(start-1, start) && '\n'=== text.slice(start-2, start-1)) ||
                        (end<text.length-2 && '\n'===text.slice(end, end+1) && '\n'===text.slice(end+1, end+2))))
                    { console.log('２つ以上の連続した改行は入力禁止'); this.isBanNewLine=true; return }
                    // 対象文字がブロック分断用改行コードなら、前後ブロックを更新する
                    if (this.#isDeleteBlock(text, start, end)) {
                        console.log('対象文字がブロック分断用改行コードなら、前後ブロックを更新する')
                        //const delTxt = this.#deletedText(e)
                        //const [index, blocks, deleteCount] = TextBlock.cutBlocks(e.target.selectionStart, e.target.selectionEnd, delTxt, this.htmlViewer.parser.textBlocks)
                        //const [index, blocks, deleteCount] = TextBlock.cutBlocks(e.target.selectionStart - (('deleteContentBackward'===e.inputType) ? 1 : 0), e.target.selectionEnd - (('deleteContentForward'===e.inputType) ? 1 : 0), text, this.htmlViewer.parser.textBlocks)
                        //const [index, blocks, deleteCount] = TextBlock.cutBlocks(e.target.selectionStart - (('Backspace'===e.key) ? 1 : 0), e.target.selectionEnd + (('Delete'===e.key) ? 1 : 0), text, this.htmlViewer.parser.textBlocks)
                        const [index, blocks, deleteCount] = TextBlock.cutBlocks(start, end, text, this.htmlViewer.parser.textBlocks)
                        console.log(index, deleteCount, blocks)
                        this.htmlViewer.htmls = this.htmlViewer.parser.pasteBlocks(index, blocks, deleteCount)
                        this.isSelectedEdit = true; 
                        return
                    }
                }
            default: break
        }
    }
    //#isDeleteBlock(text, start, end) { return ('\n'===this.selectedText && ('\n'===text.slice(start-1, start) || '\n'===text.slice(end-1, end))) }
    #isDeleteBlock(text, start, end) { console.log('#isDeleteBlock():', ('\n'===this.selectedText && ('\n'===text.slice(start-1, start) || '\n'===text.slice(end-1, end))), start, end, this.selectedText, text); return ('\n'===this.selectedText && ('\n'===text.slice(start-1, start) || '\n'===text.slice(end-1, end))) }
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
    #input(e) {
        // 選択範囲があり押下キーがDelete/BkSpであるなら、選択範囲が含まれるブロックを更新する
        // 選択範囲があり押下キーがDelete/BkSpでないなら、選択範囲が含まれるブロックを更新する

        // 選択範囲がなく押下キーがDelete/BkSpでないなら、現在ブロックを更新する
        // 選択範囲がなく押下キーがDelete/BkSpであり対象文字がブロック分断用改行コードなら、前後ブロックを更新する
        // 選択範囲がなく押下キーがDelete/BkSpであり対象文字がブロック分断用改行コード以外なら、現在ブロックを更新する
        console.log('#input(): inputType', e.inputType)
        const text = e.target.value
        const start = e.target.selectionStart
        const end = e.target.selectionEnd
        let updateText = text
        console.log('start:', start)
        console.log('end:', end)
        console.log('selectedText:', text.slice(start, end))
        console.log('text:', text)
        console.log('範囲選択なし')
        if (this.#isDeleteKey(e)) {
            console.log('BkSp|Del押下')
            // 何もしない
            if (0===start && 'deleteContentBackward'===e.inputType) { return } // 先頭でBkSp
            if (e.target.value.length-1===end&& 'deleteContentForward'===e.inputType) { return } // 末尾でDel
            // 対象文字がブロック分断用改行コードなら、前後ブロックを更新する
            if (this.#isDeleteBlock(text, start, end)) {
                console.log('対象文字がブロック分断用改行コードなら、前後ブロックを更新する')
                const delTxt = this.#deletedText(e)
                //const [index, blocks, deleteCount] = TextBlock.cutBlocks(e.target.selectionStart, e.target.selectionEnd, delTxt, this.htmlViewer.parser.textBlocks)
                const [index, blocks, deleteCount] = TextBlock.cutBlocks(e.target.selectionStart - (('deleteContentBackward'===e.inputType) ? 1 : 0), e.target.selectionEnd - (('deleteContentForward'===e.inputType) ? 1 : 0), delTxt, this.htmlViewer.parser.textBlocks)
                console.log(index, deleteCount, blocks)
                this.htmlViewer.htmls = this.htmlViewer.parser.pasteBlocks(index, blocks, deleteCount)
                return
            }
            // 対象文字がブロック分断用改行コード以外なら、現在ブロックを更新する
        }
        else if ('insertLineBreak'===e.inputType && ((0<start && '\n'=== text.slice(start-2, start-1)) || (end<text.length-1 && '\n'===text.slice(end, end+1) )) ) { // Enterで改行追加され、その前後が改行であるなら、ブロック追加する
            if (2<start && '\n'=== text.slice(start-3, start-2)) { console.log(); return } // 改行コードを削除する（２つ以上の連続した改行は入力禁止）
            if ((end<text.length-2 && '\n'===text.slice(end+1, end+2) )) { console.log(); return } // 改行コードを削除する（２つ以上の連続した改行は入力禁止）
            console.log('Enterで改行追加され、その前後が改行であるなら、ブロック追加する')
            /*
            const [index, blocks, deleteCount] = TextBlock.cutBlocks(start, end, text, this.htmlViewer.parser.textBlocks)
            console.log(index, deleteCount, blocks)
            this.htmlViewer.htmls = this.htmlViewer.parser.pasteBlocks(index, blocks, deleteCount)
            return
            */
            //const [index, blocks] = TextBlock.pasteBlocks(start, end, '\n', text.remove(start-1), this.htmlViewer.parser.textBlocks)
            const [index, blocks] = TextBlock.pasteBlocks(start-2, end-2, '\n', text.remove(start-1), this.htmlViewer.parser.textBlocks)
            console.log(index, blocks)
            this.htmlViewer.htmls = this.htmlViewer.parser.pasteBlocks(index, blocks)
            return

        }

        // 選択範囲がなく押下キーがDelete/BkSpでないなら、現在ブロックを更新する
        console.log('同一ブロック内修正')
        // 同一ブロック内修正
        const [index, block] = TextBlock.selected(e.target.selectionStart, e.target.selectionEnd, e.target.value)
        console.log(index, block)
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.setBlockText(index, block)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
    }
    #isDeleteKey(e) {
        switch (e.type) {
            case 'input':
                switch (e.inputType) {
                    case 'deleteContentBackward': return true; // BkSp
                    case 'deleteContentForward': return true; // DELETE
                    default: return false
                }
                break
            case 'keydown':
                switch (e.key) {
                    case 'Backspace': return true; // BkSp
                    case 'Delete': return true; // DELETE
                    default: return false
                }
                break
        }
    }
    #deletedText(e) {
        switch (e.type) {
            case 'input':
                switch (e.inputType) {
                    case 'deleteContentBackward': return e.target.value.remove(e.target.selectionStart-1); // BkSp
                    case 'deleteContentForward': return e.target.value.remove(e.target.selectionEnd); // DELETE
                }
                break
            case 'keydown':
                switch (e.key) {
                    case 'Backspace': return e.target.value.remove(e.target.selectionStart-1); // BkSp
                    case 'Delete': return e.target.value.remove(e.target.selectionEnd); // DELETE
                }
                break
        }
        console.warn('#deletedText(e):削除以外で使用されてしまった：', e.inputType, e)
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
