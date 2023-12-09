(function(){
class TextBlock {
    static fromText(text) { return this.fromLines(this.#textToLines(text)) }
    static fromLines(lines) {
        const [blocks, block] = [[], []]
        for (let line of lines) {
            block.push(line)
            if (''===line && 0 < block.length) { blocks.push(block.join('\n').trimLine()); block.splice(0); }
        }
        if (0 < block.length) { blocks.push(block.join('\n').trimLine()) }
        return blocks.filter(v=>v)
    }
    static #textToLines(text) { return text.trim().split(/\r?\n/) }
    static selectedIndex(selectionEnd, text) { return this.selectedIndexBlock(selectionEnd, text)[0] } 
    static selectedText(selectionEnd, text) { return this.selectedIndexBlock(selectionEnd, text)[1] } 
    static selected(selectionStart, selectionEnd, text) {
        // テキストブロック・インデックス取得
        const textFront = text.slice(0, selectionStart)
        const textBack = text.slice(selectionEnd)
        const selectedBlockIndex = this.count(textFront)-1
        // キャレット位置のブロックテキスト取得
        const blockStart = textFront.lastIndexOf('\n\n')
        const blockEnd = textBack.indexOf('\n\n')
        console.log(blockStart, blockEnd+textFront.length)
        if (-1 === blockStart) { return [0, textFront] }
        if (-1 === blockEnd) { return [this.count(text)-1, textBack] }
        const block = text.slice((blockStart+2), blockEnd+textFront.length)
        //const block = text.slice(((-1<blockStart) ? blockStart+2 : 0), (-1<blockEnd) ? blockEnd+textFront.length : text.length)
        return [selectedBlockIndex, block]
    }
    static count(text) { return (text.match(/[\n]{2,}/g) || []).length + 1 } // text内にあるブロック数

    static cutBlocks(selectionStart, selectionEnd, text, blocks) {
        console.log('cutBlocks()', selectionStart, selectionEnd, text, blocks)
        // カットした結果、ブロック用改行が削除されてブロック同士が結合してしまう場合がある。なので最初にカットしたブロックとその次のブロックそれぞれのテキストを取得しておく。それらを結合し、カット範囲内を削除したテキストをTextBlock.fromText()した結果を挿入する
        const [index, block] = this.selected(selectionStart, selectionEnd, text)
        console.log(index, block)
        const nextBlockText = (index+1<blocks.length) ? blocks[index+1] : ''
        console.log('nextBlockText:', nextBlockText)
        const textFront = text.slice(0, selectionStart)
        const textBack = text.slice(selectionEnd)
        console.log(text)
        console.log(textFront)
        console.log(textBack)
        const blockFront = textFront.slice((-1===textFront.lastIndexOf('\n\n')) ? 0 : textFront.lastIndexOf('\n\n')+2)
        const blockBack = textBack.slice(0, (-1===textBack.indexOf('\n\n')) ? 0 : textBack.indexOf('\n\n'))
        console.log('blockFront:', blockFront)
        console.log('blockBack:', blockBack)
        console.log('blockBack.trimLine():', blockBack.trimLine())
        console.log('nextBlockText:', nextBlockText)
        console.log((blockBack.trimLine()==nextBlockText))

        const cutText = text.slice(selectionStart, selectionEnd)
        console.log(cutText)
        console.log(cutText.endsWith('\n'))
        const insertText = (blockFront+blockBack+((cutText.endsWith('\n') ? '' : '\n\n'+nextBlockText))).trimLine()
        console.log(insertText)
        const pasteBlocks = this.fromLines(insertText.split(/\r?\n/))
        console.log(pasteBlocks)
        return [index, pasteBlocks]
    }
    static pasteBlocks(selectionStart, selectionEnd, pasteText, text, blocks) {
        const [index, _] = this.selected(selectionStart, selectionEnd, text)
        console.log(`index: ${index}`)
        // ペースト位置のブロックと、その次のブロックの範囲のテキストを取得する。それらとペーストするテキストを結合してTextBlock.fromText()でブロック配列にして挿入する。これによって面倒な改行によるブロックの上書きや挿入といった個別判定が不要になる。
        const textFront = text.slice(0, selectionStart)
        const textBack = text.slice(selectionEnd)
        console.log(textFront)
        console.log(textBack)

//        const pasteText = this.#getClipboardText(e)
        console.log('pasteText:', pasteText, (pasteText.match(/[\n]/g) || []).length)
//        const pasteBlocks = TextBlock.fromText(pasteText)
        const blockFront = textFront.slice((-1===textFront.lastIndexOf('\n\n')) ? 0 : textFront.lastIndexOf('\n\n')+2)
        const blockBack = textBack.slice(0, (-1===textBack.indexOf('\n\n')) ? 0 : textBack.indexOf('\n\n'))
        console.log('blockFront:', blockFront)
        console.log('blockBack:', blockBack)
        console.log('blockBack.trimLine():', blockBack.trimLine())

//      const nextBlockText = (index+1<this.htmlViewer.parser.textBlocks.length) ? this.htmlViewer.parser.textBlocks[index+1] : ''
        const nextBlockText = (index+1<blocks.length) ? blocks[index+1] : ''
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
        return [index, pasteBlocks]
    }
}
window.TextBlock = TextBlock
})()
