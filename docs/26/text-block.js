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
    static #textToLines(text) { return text.trimLine().split(/\r?\n/) }
    static selectedIndex(selectionEnd, text) { return this.selectedIndexBlock(selectionEnd, text)[0] } 
    static selectedText(selectionEnd, text) { return this.selectedIndexBlock(selectionEnd, text)[1] } 
    static selected(selectionStart, selectionEnd, text) {
        if (!text.includes('\n\n')) { return [0, text] }
        // テキストブロック・インデックス取得
        const textFront = text.slice(0, selectionStart)
        if (!textFront.includes('\n\n')) { return [0, text.slice(0, text.indexOf('\n\n'))] }
        const textBack = text.slice(selectionEnd)
        const selectedBlockIndex = this.count(textFront)-1
        // キャレット位置のブロックテキスト取得
        const blockStart = textFront.lastIndexOf('\n\n')
        const blockEnd = textBack.indexOf('\n\n')
        console.debug(blockStart, blockEnd+textFront.length)
        console.debug('textFront:', textFront)
        console.debug('textBack:', textBack)
        if (-1 === blockStart) { return [0, textFront] }
        if (-1 === blockEnd) { return [this.count(text)-1, textBack] }
        const block = text.slice((blockStart+2), blockEnd+textFront.length)
        console.debug(selectedBlockIndex, block)
        return [selectedBlockIndex, block]
    }
    static count(text) { return (text.match(/[\n]{2,}/g) || []).length + 1 } // text内にあるブロック数
    static cutBlocks(selectionStart, selectionEnd, text, blocks) {
        console.log('cutBlocks():', selectionStart, selectionEnd, text, blocks)
        const cutText = text.slice(selectionStart, selectionEnd)
        const cutInnerBlockCount = (cutText.trimLine().match(/[\n]{2,}/g) || []).length
        const textFront = text.slice(0, selectionStart)
        const textBack = text.slice(selectionEnd)
        const blockFront = textFront.slice((-1===textFront.lastIndexOf('\n\n')) ? 0 : textFront.lastIndexOf('\n\n')+2)
        const blockBack = textBack.slice(0, (-1===textBack.indexOf('\n\n')) ? textBack.length : textBack.indexOf('\n\n'))
        const [index, block] = this.selected(selectionStart, selectionEnd, text)
        const deleteCount = cutInnerBlockCount + 1 + this.#deleteCount(cutText, textFront, textBack)
        const nextBlockText = (index<blocks.length) ? blocks[index+1] : ''
        const blockEndText = this.#blockBack(cutText, textFront, textBack, blockBack, nextBlockText)
        const pasteBlocks = this.fromLines((blockFront + blockEndText).split(/\r?\n/))
        console.debug('textFront:', textFront)
        console.debug('textBack:', textBack)
        console.debug('blockFront:', blockFront)
        console.debug('blockBack:', blockBack)
        console.debug('blockBack.trimLine():', blockBack.trimLine())
        console.debug('blockEndText:', blockEndText)
        console.debug(`cutText: ${(cutText.match(/^[\n]{2,}/g) || []).length} : ${(cutText.match(/[\n]{2,}$/g) || []).length} : ${cutText}`)
        console.debug('#deleteCount():', this.#deleteCount(cutText, textFront, textBack))
        console.debug(`cutInnerBlockCount: ${cutInnerBlockCount}`)
        console.debug(`cutText.trimLine(): ${cutText.trimLine()}`)
        console.debug(`(cutText.match(/[\n]/g) | []).length: ${(cutText.match(/[\n]/g) || []).length}`)
        console.debug(`(cutText.match(/[\n]/g) | []).length: ${(cutText.match(/[\n]/g) || []).length}`)
        console.debug(`((cutText.match(/[\n]/g) | []).length)/2: ${((cutText.match(/[\n]/g) || []).length)/2}`)
        console.debug(`Math.ceil(((cutText.match(/[\n]/g) | []).length)/2): ${Math.ceil(((cutText.match(/[\n]/g) || []).length)/2)}`)
        console.debug('blockEndText:', blockEndText)
        console.debug('blockBack.trimLine()==nextBlockText:', blockBack.trimLine()==nextBlockText)
        console.debug(index, deleteCount, pasteBlocks)
        return [index, pasteBlocks, deleteCount]
    }
    static #blockBack(cutText, textFront, textBack, blockBack, nextBlockText) {
        if (cutText.startsWith('\n') && cutText.endsWith('\n') && textFront.endsWith('\n') && textBack.startsWith('\n')) { return '' } // cutText先頭末尾\n含むとき''を返したい
        if (cutText.endsWith('\n') && textBack.startsWith('\n')) { return blockBack } // cutText先頭末尾\n含むとき''を返したい
        if (cutText.startsWith('\n') && textFront.endsWith('\n')) { return blockBack }
        if (cutText.endsWith('\n\n')) { return blockBack }
        if (blockBack.trimLine()==nextBlockText) { return '' }
        return blockBack
    }
    static #deleteCount(cutText, textFront, textBack) {
        if ((4 <= cutText.length) && cutText.startsWith('\n\n') && cutText.endsWith('\n\n')) { return 2 }
        if (cutText.startsWith('\n\n')) { return (cutText.endsWith('\n') && textBack.startsWith('\n')) ? 2 : 1 }
        if (cutText.endsWith('\n\n')) { return (cutText.startsWith('\n') && textFront.endsWith('\n')) ? 2 : 1 }
//        if (cutText.startsWith('\n\n')) { return (cutText.endsWith('\n') && textBack.startsWith('\n')) ? 2 : 1 }
//        if (cutText.endsWith('\n\n')) { return (cutText.startsWith('\n') && textFront.endsWith('\n')) ? 2 : 1 }
        if (cutText.startsWith('\n') && textFront.endsWith('\n')) { return 1 }
        if (cutText.endsWith('\n') && textBack.startsWith('\n')) { return 1 }
        return 0
    }
    static pasteBlocks(selectionStart, selectionEnd, pasteText, text, blocks) {
        console.debug('pasteBlocks():', selectionStart, selectionEnd, pasteText, text, blocks)
        const cutText = text.slice(selectionStart, selectionEnd)
        const [index, _] = this.selected(selectionStart, selectionEnd, text)
        console.debug(`index: ${index}`)
        // ペースト位置のブロックと、その次のブロックの範囲のテキストを取得する。それらとペーストするテキストを結合してTextBlock.fromText()でブロック配列にして挿入する。これによって面倒な改行によるブロックの上書きや挿入といった個別判定が不要になる。
        const textFront = text.slice(0, selectionStart)
        const textBack = text.slice(selectionEnd)
        console.debug('textFront:', textFront)
        console.debug('textBack:', textBack)

        console.debug('pasteText:', pasteText, (pasteText.match(/[\n]/g) || []).length)
        const blockFront = textFront.slice((-1===textFront.lastIndexOf('\n\n')) ? 0 : textFront.lastIndexOf('\n\n')+2)
        const blockBack = textBack.slice(0, (-1===textBack.indexOf('\n\n')) ? 0 : (0===textBack.indexOf('\n\n') ? textBack.slice(2).indexOf('\n\n')+2 : textBack.indexOf('\n\n')))
        console.debug('blockFront:', blockFront)
        console.debug('blockBack:', blockBack)
        console.debug('blockBack.trimLine():', blockBack.trimLine())

        const nextBlockText = (index+1<blocks.length) ? blocks[index+1] : ''
        console.debug('nextBlockText:', nextBlockText)
        console.debug('blockBack.trimLine()==nextBlockText:', blockBack.trimLine()==nextBlockText)
        const pasteBlocks = TextBlock.fromLines(((blockFront + pasteText + blockBack) + (((blockBack.trimLine()==nextBlockText) || (cutText.startsWith('\n') && cutText.endsWith('\n') && textFront.endsWith('\n') && textBack.startsWith('\n'))) ? '' : '\n\n' + nextBlockText)).split(/\r?\n/))
        console.debug('pasteBlocks:', pasteBlocks)
        const cutInnerBlockCount = (cutText.trimLine().match(/[\n]{2,}/g) || []).length
        const deleteCount = cutInnerBlockCount + 1 + this.#deleteCount(cutText, textFront, textBack)
        console.debug(index, deleteCount, pasteBlocks)
        return [index, pasteBlocks, deleteCount ]
    }
}
window.TextBlock = TextBlock
})()
