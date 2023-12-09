(function(){
class TextBlock {
    static fromText(text) { return this.fromLines(this.#textToLines(text)) }
    static fromLines(lines) {
        const [blocks, block] = [[], []]
        for (let line of lines) {
            block.push(line)
            //if (''===line && 0 < block.length) { blocks.push(block.join('\n')); block.splice(0); }
            if (''===line && 0 < block.length) { blocks.push(block.join('\n').trimLine()); block.splice(0); }
        }
        //if (0 < block.length) { blocks.push(block.join('\n')) }
        if (0 < block.length) { blocks.push(block.join('\n').trimLine()) }
        return blocks.filter(v=>v)
    }
    //static #textToLines(text) { return text.trim().split(/\r?\n/) }
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
        const block = text.slice(((-1<blockStart) ? blockStart+2 : 0), (-1<blockEnd) ? blockEnd+textFront.length : text.length)
        return [selectedBlockIndex, block]
    }
    /*
    static selected(selectionEnd, text) {
        // テキストブロック・インデックス取得
        const textBefore = text.slice(0, selectionEnd) // キャレット位置より前
        const textAfter = text.slice(selectionEnd) // キャレット位置より後
        //const selectedBlockIndex = (textBefore.match(/[\n]{2,}/g) || []).length
        const selectedBlockIndex = this.count(textBefore)-1
        console.log('selectedBlockIndex:', selectedBlockIndex )
        // キャレット位置のブロックテキスト取得
        const blockStart = textBefore.lastIndexOf('\n\n')
        const blockEnd = textAfter.indexOf('\n\n')
        console.log(blockStart, blockEnd+textBefore.length)
        const block = text.slice(((-1<blockStart) ? blockStart+2 : 0), (-1<blockEnd) ? blockEnd+textBefore.length : text.length)
        return [selectedBlockIndex, block]
    }
    */
    static count(text) { return (text.match(/[\n]{2,}/g) || []).length + 1 } // text内にあるブロック数

    static cutBlocks(block, selectionStart, selectionEnd) {

    }
    static pasteBlocks(block, selectionEnd, addText) {

    }
}
window.TextBlock = TextBlock
})()
