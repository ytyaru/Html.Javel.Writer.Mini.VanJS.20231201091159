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
        console.debug(blockStart, blockEnd+textFront.length)
        if (-1 === blockStart) { return [0, textFront] }
        if (-1 === blockEnd) { return [this.count(text)-1, textBack] }
        const block = text.slice((blockStart+2), blockEnd+textFront.length)
        return [selectedBlockIndex, block]
    }
    static count(text) { return (text.match(/[\n]{2,}/g) || []).length + 1 } // text内にあるブロック数
    static cutBlocks(selectionStart, selectionEnd, text, blocks) {
        const cutText = text.slice(selectionStart, selectionEnd)
        const cutInnerBlockCount = (cutText.trimLine().match(/[\n]{2,}/g) || []).length
        const textFront = text.slice(0, selectionStart)
        const textBack = text.slice(selectionEnd)
        const blockFront = textFront.slice((-1===textFront.lastIndexOf('\n\n')) ? 0 : textFront.lastIndexOf('\n\n')+2)
        const blockBack = textBack.slice(0, (-1===textBack.indexOf('\n\n')) ? textBack.length : textBack.indexOf('\n\n'))
        const [index, block] = this.selected(selectionStart, selectionEnd, text)
        const deleteCount = cutInnerBlockCount + 1 + this.#deleteCount(cutText, textFront, textBack)
        const pasteBlocks = this.fromLines((blockFront + blockBack).split(/\r?\n/))
        console.log(index, deleteCount, pasteBlocks)
        return [index, pasteBlocks, deleteCount]
    }
    static #deleteCount(cutText, textFront, textBack) {
        if (cutText.startsWith('\n') && textFront.endsWith('\n')) { return 1 }
        if (cutText.endsWith('\n') && textBack.startsWith('\n')) { return 1 }
        return 0
    }
    /*
    static cutBlocks(selectionStart, selectionEnd, text, blocks) {
        console.debug('cutBlocks()', selectionStart, selectionEnd, text, blocks)
        const textFront = text.slice(0, selectionStart)
        const textBack = text.slice(selectionEnd)
        console.debug('text:', text)
        console.debug('textFront:', textFront)
        console.debug('textBack:', textBack)
        const blockFront = textFront.slice((-1===textFront.lastIndexOf('\n\n')) ? 0 : textFront.lastIndexOf('\n\n')+2)
        const blockBack = textBack.slice(0, (-1===textBack.indexOf('\n\n')) ? textBack.length : textBack.indexOf('\n\n'))
        console.debug('blockFront:', blockFront)
        console.debug('blockBack:', blockBack)
        console.debug('blockBack.trimLine():', blockBack.trimLine())

        const cutText = text.slice(selectionStart, selectionEnd)
        console.debug(`cutText: ${(cutText.match(/^[\n]{2,}/g) || []).length} : ${(cutText.match(/[\n]{2,}$/g) || []).length} : ${cutText}`)
        console.debug(`cutText: ${cutText.startsWith('\n')} : ${cutText.endsWith('\n')}`)
        const isCutBlock = (cutText.startsWith('\n') && cutText.endsWith('\n')) && (textFront.endsWith('\n') && textBack.startsWith('\n'))
        console.debug(`isCutBlock: ${isCutBlock}`)
        //const isCutBlock = (cutText.startsWith('\n') && cutText.endsWith('\n')) && ()
        // カットした結果、ブロック用改行が削除されてブロック同士が結合してしまう場合がある。なので最初にカットしたブロックとその次のブロックそれぞれのテキストを取得しておく。それらを結合し、カット範囲内を削除したテキストをTextBlock.fromText()した結果を挿入する
        const [index, block] = this.selected(selectionStart, selectionEnd, text)
        console.debug(index, block)
        const nextBlockText = (index+1<blocks.length) ? blocks[index+1+((isCutBlock) ? 1 : 0)] : ''
        console.debug('nextBlockText:', nextBlockText)
        console.debug('blockBack.trimLine()==nextBlockText:', (blockBack.trimLine()==nextBlockText))
        
        //const insertText = (blockFront+((isCutBlock) ? '' : blockBack)+(((cutText.endsWith('\n') && textFront.endsWith('\n') && textBack.startsWith('\n')) ? '' : '\n\n'+nextBlockText))).trimLine()
        //const insertText = (blockFront+((isCutBlock || (blockBack.trimLine()==nextBlockText)) ? '' : blockBack)+(((cutText.endsWith('\n') && textFront.endsWith('\n') && textBack.startsWith('\n')) ? '' : '\n\n'+nextBlockText))).trimLine()
        const insertText = (blockFront+
            ((isCutBlock || (blockBack.trimLine()==nextBlockText)) ? '' : blockBack)+
            (((cutText.startsWith('\n') && textFront.endsWith('\n')) || (cutText.endsWith('\n') && textBack.startsWith('\n'))) ? '' : '\n\n'+nextBlockText)).trimLine()
        
        console.debug(insertText)
        const pasteBlocks = this.fromLines(insertText.split(/\r?\n/))
        console.debug(pasteBlocks)
        return [index, pasteBlocks]
    }
    */
    static pasteBlocks(selectionStart, selectionEnd, pasteText, text, blocks) {
        const [index, _] = this.selected(selectionStart, selectionEnd, text)
        console.debug(`index: ${index}`)
        // ペースト位置のブロックと、その次のブロックの範囲のテキストを取得する。それらとペーストするテキストを結合してTextBlock.fromText()でブロック配列にして挿入する。これによって面倒な改行によるブロックの上書きや挿入といった個別判定が不要になる。
        const textFront = text.slice(0, selectionStart)
        const textBack = text.slice(selectionEnd)
        console.debug('textFront:', textFront)
        console.debug('textBack:', textBack)

        console.debug('pasteText:', pasteText, (pasteText.match(/[\n]/g) || []).length)
        const blockFront = textFront.slice((-1===textFront.lastIndexOf('\n\n')) ? 0 : textFront.lastIndexOf('\n\n')+2)
        const blockBack = textBack.slice(0, (-1===textBack.indexOf('\n\n')) ? 0 : textBack.indexOf('\n\n'))
        console.debug('blockFront:', blockFront)
        console.debug('blockBack:', blockBack)
        console.debug('blockBack.trimLine():', blockBack.trimLine())

        const nextBlockText = (index+1<blocks.length) ? blocks[index+1] : ''
        console.debug('nextBlockText:', nextBlockText)
        console.debug('blockBack.trimLine()==nextBlockText:', blockBack.trimLine()==nextBlockText)
        const pasteBlocks = TextBlock.fromLines(((blockFront + pasteText + blockBack) + ((blockBack.trimLine()==nextBlockText) ? '' : '\n\n' + nextBlockText)).split(/\r?\n/))
        console.debug('pasteBlocks:', pasteBlocks)
        return [index, pasteBlocks]
    }
}
window.TextBlock = TextBlock
})()
