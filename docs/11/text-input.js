(function(){
const { textarea } = van.tags
class TextInput {
    constructor(htmlViewer) { this.id='manuscript'; this.htmlViewer=htmlViewer; this.isComposing=false; this.isCut=false; }
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
        console.log(e)
        //this.htmlViewer.ja.val = e.target.value
        this.#parse(e)
    }
    #onCut(e) {
        console.log('CUT !!!!!!!', e)
        console.log(e.target.selectionStart, e.target.selectionEnd)
        /*
        const text = e.target.value
        const textFront = e.target.value.slice(0, e.target.selectionStart)
        const textBack = e.target.value.slice(e.target.selectionEnd)

        const cutText = window.getSelection().toString()
        const cutCount = TextBlock.count(cutText)
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.setBlockText(index, block)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
        if (1 < cutCount) {
            this.htmlViewer._htmls.val = [...this.htmlViewer.parser.cutBlocks(index+1)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
        }
        */

        // カットした結果、ブロック用改行が削除されてブロック同士が結合してしまう場合がある。なので最初にカットしたブロックとその次のブロックそれぞれのテキストを取得しておく。それらを結合し、カット範囲内を削除したテキストをTextBlock.fromText()した結果を挿入する
        const [index, block] = TextBlock.selected(e.target.selectionEnd, e.target.value.trim())
        console.log(index, block)
        //console.log()
        const nextBlockText = (index+1<this.htmlViewer.parser.textBlocks.length) ? this.htmlViewer.parser.textBlocks[index+1] : ''
        console.log('nextBlockText:', nextBlockText)
        //const text = (block + '\n\n' + nextBlockText)
        const text = e.target.value
        const textFront = text.slice(0, e.target.selectionStart)
        const textBack = text.slice(e.target.selectionEnd)
        console.log(text)
        console.log(textFront)
        console.log(textBack)
        const blockFront = textFront.slice((-1===textFront.lastIndexOf('\n\n')) ? 0 : textFront.lastIndexOf('\n\n')+2)
        const blockBack = textBack.slice(0, (-1===textBack.indexOf('\n\n')) ? 0 : textBack.indexOf('\n\n'))
        console.log('blockFront:', blockFront)
        console.log('blockBack:', blockBack)
        //const blocks = TextBlock.fromText(textFront+textBack)
        //const blocks = TextBlock.fromText(blockFront+blockBack)
        //const blocks = TextBlock.fromText((blockFront+blockBack)+'\n\n'+nextBlockText)
        console.log('blockBack.trimLine():', blockBack.trimLine())
        console.log('nextBlockText:', nextBlockText)
        console.log((blockBack.trimLine()==nextBlockText)) // trueのはず
        console.log(((blockBack.trimLine())===nextBlockText))
        console.log(((blockBack.trimLine())==nextBlockText))
        console.log(this.htmlViewer.parser.textBlocks[index+1]===nextBlockText)
        console.log(nextBlockText===nextBlockText)
        console.log(blockBack===blockBack)
        console.log(blockBack.trimLine()===blockBack.trimLine())
        console.log(blockBack===blockBack.trimLine())
        console.log(blockBack.trim()===blockBack.trimLine())

        console.log(blockBack.trimLine().length, nextBlockText.length)
        console.log(blockBack.trimLine().length, nextBlockText.trimLine().length)
        for (let i=0; i<blockBack.trimLine().length; i++) {
            if (blockBack.trimLine()[i]!==nextBlockText[i]) {
                console.warn(i, blockBack.trimLine()[i], nextBlockText[i])
            }
        }

        //const blocks = TextBlock.fromText((blockFront+blockBack) + ((blockBack.trimLine()==nextBlockText) ? '' : '\n\n' + nextBlockText))
        //const blocks = TextBlock.fromLines(((blockFront+blockBack) + ((blockBack.trimLine()==nextBlockText) ? '' : '\n\n' + nextBlockText)).trimLine().split(/\r?\n/))
//        const cutText = text.slice(e.target.selectionStart, e.target.selectionEnd)
        //const blocks = TextBlock.fromLines(((blockFront+blockBack) + ((!(cutText.includes('\n\n'))) ? '' : '\n\n' + nextBlockText)).trimLine().split(/\r?\n/))
        //const blocks = TextBlock.fromLines((blockFront+blockBack).trimLine().split(/\r?\n/))
        const cutText = text.slice(e.target.selectionStart, e.target.selectionEnd+1)
        console.log(cutText)
        console.log(cutText.endsWith('\n'))
//        const deleteCount = (cutText.endsWith('\n')) ? 3 : 2
        //const blocks = TextBlock.fromLines((blockFront+blockBack+((cutText.includes('\n\n') ? '\n\n'+nextBlockText : ''))).trimLine().split(/\r?\n/))
        //const insertText = (blockFront+blockBack+((cutText.endsWith('\n') ? '\n\n'+nextBlockText : ''))).trimLine()
        const insertText = (blockFront+blockBack+((cutText.endsWith('\n') ? '' : '\n\n'+nextBlockText))).trimLine()
        console.log(insertText)
        //const blocks = TextBlock.fromLines((blockFront+blockBack+((cutText.endsWith('\n') ? '\n\n'+nextBlockText : ''))).trimLine().split(/\r?\n/))
        const blocks = TextBlock.fromLines(insertText.split(/\r?\n/))
        //const blocks = TextBlock.fromLines((blockFront+blockBack+'\n\n'+nextBlockText).trimLine().split(/\r?\n/))
        console.log(blocks)
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.pasteBlocks(index, blocks)]
        //this.htmlViewer._htmls.val = [...this.htmlViewer.parser.pasteBlocks(index, blocks, deleteCount)]
        this.isCut = true

        /*
        //const [index, block] = TextBlock.selected(e.target.selectionEnd, e.target.value.trim())
        const [index, _] = TextBlock.selected(e.target.selectionEnd, e.target.value.trim())
        //console.log(block)
        const cutText = window.getSelection().toString()
        console.log(cutText)
        const cutCount = TextBlock.count(cutText)
        //this.htmlViewer.setBlockText(index, block)
        setTimeout(()=>{ // https://pisuke-code.com/javascript-clipboard-cut-event/#113060-19
            //const [afterIndex, afterBlock] = TextBlock.selected(e.target.selectionEnd, e.target.value.trim())
            const [_, block] = TextBlock.selected(e.target.selectionEnd, e.target.value.trim())
            //this.htmlViewer.parser.setBlockText(index, block)
            this.htmlViewer._htmls.val = [...this.htmlViewer.parser.setBlockText(index, block)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
            if (1 < cutCount) {
                this.htmlViewer._htmls.val = [...this.htmlViewer.parser.cutBlocks(index+1)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
                //this.htmlViewer.parser.textBlocks.splice(index+1, cutCount)
                //this.htmlViewer._htmls.splice(index+1, cutCount)
            }

        }, 0);
        this.isCut = true
        */
    }
    #getClipboardText(e) {
        if (e.clipboardData && e.clipboardData.getData) { return e.clipboardData.getData('text/plain') } // 他
        else if (window.clipboardData && window.clipboardData.getData) { return window.clipboardData.getData('Text') } // IE
        throw new Error('clipboardData API がありません。')
    }
    #onPaste(e) {
        console.log('PASTE !!!!!!!!!')
        console.log(e.target.selectionStart, e.target.selectionEnd)
        const [index, _] = TextBlock.selected(e.target.selectionEnd, e.target.value.trim())
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
        //const pasteBlocks = TextBlock.fromText((blockFront + pasteText + blockBack) + '\n\n' + nextBlockText)
        //const pasteBlocks = TextBlock.fromText((blockFront + pasteText + blockBack) + ((blockBack===nextBlockText) ? '' : '\n\n' + nextBlockText))
        //const pasteBlocks = TextBlock.fromText((blockFront + pasteText + blockBack) + ((blockBack.trimLine()===nextBlockText) ? '' : '\n\n' + nextBlockText))
        const pasteBlocks = TextBlock.fromText((blockFront + pasteText + blockBack) + ((blockBack.trimLine()==nextBlockText) ? '' : '\n\n' + nextBlockText))
        console.log(pasteBlocks)
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.pasteBlocks(index, pasteBlocks)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
        /*
        if (-1 === pasteText.indexOf('\n\n')) {

        }
        const pasteBlockTextFirst = blockFront + pasteText.slice(0, pasteText.indexOf('\n\n')) + blockBack
        const pasteBlockTextLast = blockFront + pasteText.slice(0, pasteText.indexOf('\n\n')) + blockBack

        
        console.log(blockFront)
        console.log(blockBack)
        return 
        */
        /*
        const text = e.target.value
        const textFront = text.slice(0, e.target.selectionStart)


        if (e.target.selectionStart !== e.target.selectionEnd) { } // 選択範囲をカット
        const [index, block] = TextBlock.selected(e.target.selectionEnd, e.target.value.trim())
        const pasteText = this.#getClipboardText()
        //const pasteText = e.target.value.slice(e.target.selectionStart, e.target.selectionEnd)
        const pasteBlocks = TextBlock.fromText(pasteText)
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.insertBlocks(index, pasteBlocks)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
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

        const [index, block] = TextBlock.selected(e.target.selectionEnd, e.target.value.trim())
        this.htmlViewer._htmls.val = [...this.htmlViewer.parser.setBlockText(index, block)] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様
//        this.htmlViewer.parser.setBlockText(index, block)
//        this.htmlViewer._htmls.val = [...this.htmlViewer._htmls.val] // 反応させるには新しい別の配列オブジェクトにする必要があるみたい。VanJSの仕様

        /*
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
        */
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
